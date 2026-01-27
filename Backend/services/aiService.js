const { OpenAI } = require("openai");

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_TOKEN,
});

class AIService {
  constructor() {
    this.conversationHistory = new Map();
  }

  async analyzeReportsWithAI(reports, adminContext = {}) {
    try {
      const systemPrompt = `You are an intelligent admin assistant for UniNest, a student housing platform.

Your role is to analyze user reports and provide actionable recommendations in JSON format.

CRITICAL RULES:
1. You MUST respond with valid JSON only
2. You NEVER take actions directly - you only recommend
3. You analyze patterns, severity, and user history
4. You prioritize reports based on urgency and potential harm
5. You provide clear reasoning for every recommendation

SEVERITY LEVELS:
- low: Minor issues, first-time offenses, misunderstandings
- medium: Repeated minor issues, potentially harmful content
- high: Harassment, scams, hate speech, multiple reports
- critical: Threats, severe harassment, dangerous content, repeat offenders

RECOMMENDED ACTIONS:
- none: False report or resolved misunderstanding
- warning: First offense, educate user on platform rules
- suspended: Repeated violations, temporary messaging ban
- banned: Severe violations, dangerous behavior, repeat offender

RESPONSE FORMAT (JSON only):
{
  "recommendations": [
    {
      "reportId": "report-uuid",
      "action": "warning|suspended|banned|none",
      "reasoning": "detailed explanation",
      "priority": 1-10,
      "severity": "low|medium|high|critical"
    }
  ],
  "patterns": [
    {
      "reportIds": ["uuid1", "uuid2"],
      "pattern": "description of pattern",
      "suggestedBulkAction": "action"
    }
  ],
  "summary": "overall analysis summary"
}`;

      const userPrompt = this.buildReportsAnalysisPrompt(reports, adminContext);

      const response = await client.chat.completions.create({
        model: "openai/gpt-oss-120b:groq",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const content = response.choices[0].message.content;
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("AI did not return valid JSON");
      }

      const analysisResults = JSON.parse(jsonMatch[0]);

      analysisResults.recommendations = analysisResults.recommendations || [];
      analysisResults.patterns = analysisResults.patterns || [];
      analysisResults.summary = analysisResults.summary || "Analysis complete.";

      analysisResults.recommendations = analysisResults.recommendations.map(rec => {
        const report = reports.find(r => r.id === rec.reportId);
        return {
          ...rec,
          reportedUser: report?.reportedUser ? {
            id: report.reportedUserId,
            name: `${report.reportedUser.firstName} ${report.reportedUser.lastName}`,
            email: report.reportedUser.email,
          } : null,
        };
      });

      analysisResults.severityAnalysis = analysisResults.recommendations.map(rec => ({
        reportId: rec.reportId,
        severity: rec.severity || "medium",
        reasoning: rec.reasoning,
      }));

      return analysisResults;
    } catch (error) {
      console.error("AI Analysis Error:", error);
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  buildReportsAnalysisPrompt(reports, adminContext) {
    const reportSummaries = reports.map((report, index) => {
      const reporterName = report.reporter
        ? `${report.reporter.firstName} ${report.reporter.lastName}`
        : "Unknown";
      const reportedUserName = report.reportedUser
        ? `${report.reportedUser.firstName} ${report.reportedUser.lastName}`
        : "Unknown";

      return `
Report #${index + 1} (ID: ${report.id})
- Reporter: ${reporterName} (${report.reporter?.email || "N/A"})
- Reported User: ${reportedUserName} (${report.reportedUser?.email || "N/A"})
- Reason: ${report.reason}
- Description: ${report.description || "No description provided"}
- Status: ${report.status}
- Created: ${new Date(report.createdAt).toLocaleString()}
- Message Content: ${report.message?.content || "No specific message"}
${report.reportedUser?.reportCount ? `- Previous Reports Against User: ${report.reportedUser.reportCount}` : ""}
`;
    });

    return `Please analyze the following ${reports.length} reports and provide recommendations in JSON format only.

${reportSummaries.join("\n---\n")}

${adminContext.additionalInfo ? `\nAdditional Context: ${adminContext.additionalInfo}` : ""}

Respond with ONLY a valid JSON object (no markdown, no explanation, just JSON) containing:
1. recommendations - array with reportId, action, reasoning, priority (1-10), severity
2. patterns - array of related reports if any patterns found
3. summary - brief overall assessment

Focus on helping the admin prioritize which reports need immediate attention.`;
  }

  async chatWithAdmin(message, conversationId, context = {}) {
    try {
      if (!this.conversationHistory.has(conversationId)) {
        this.conversationHistory.set(conversationId, [
          {
            role: "system",
            content: `You are an intelligent admin assistant for UniNest. You help admins manage reports, users, and platform moderation. You provide insights and recommendations but never take actions directly. Always ask for confirmation before suggesting any action that affects users.`,
          },
        ]);
      }

      const history = this.conversationHistory.get(conversationId);
      history.push({ role: "user", content: message });

      const response = await client.chat.completions.create({
        model: "openai/gpt-oss-120b:groq",
        messages: history,
        temperature: 0.7,
        max_tokens: 1000,
      });

      const assistantMessage = response.choices[0].message.content;
      history.push({ role: "assistant", content: assistantMessage });

      if (history.length > 20) {
        history.splice(1, 2);
      }

      return assistantMessage;
    } catch (error) {
      console.error("AI Chat Error:", error);
      throw new Error(`AI chat failed: ${error.message}`);
    }
  }

  clearConversation(conversationId) {
    this.conversationHistory.delete(conversationId);
  }
}

module.exports = new AIService();
