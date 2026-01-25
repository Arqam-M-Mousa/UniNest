const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { ChatMessage, User } = require("../models");
const { OpenAI } = require("openai");

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_TOKEN,
});

const STUDENT_SYSTEM_PROMPT = process.env.STUDENT_AI_PROMPT || `You are a caring and supportive AI assistant acting like a nurturing mother figure for university students living away from home. Your role is to help students with:
- Cooking tips and easy recipes for beginners
- Cleaning and organizing their apartments
- Laundry and maintenance advice
- Time management and study-life balance
- Budgeting and saving money as a student
- Health and wellness tips
- Emotional support and encouragement

Be warm, encouraging, and practical. Offer step-by-step guidance when needed. Keep responses conversational and friendly, as if you're a caring parent checking in on them.`;

const LANDLORD_SYSTEM_PROMPT = process.env.LANDLORD_AI_PROMPT || `You are an expert property management and marketing consultant specializing in student housing. Your role is to help landlords:
- Optimize property listings to attract more student tenants
- Improve property photos and descriptions
- Set competitive pricing based on market trends
- Enhance property appeal and amenities
- Handle tenant relations professionally
- Maximize occupancy rates and views
- Navigate legal and regulatory requirements
- Implement effective marketing strategies

Be professional, data-driven, and strategic. Provide actionable advice that can increase their property's visibility and rental success. Focus on ROI and practical improvements.`;

router.post("/chat", authenticate, async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const systemPrompt = user.role === "Student" ? STUDENT_SYSTEM_PROMPT : LANDLORD_SYSTEM_PROMPT;

    const chatConversationId = conversationId || require("crypto").randomUUID();

    const previousMessages = await ChatMessage.findAll({
      where: {
        userId,
        conversationId: chatConversationId,
      },
      order: [["createdAt", "ASC"]],
      limit: 20,
    });

    const messages = [
      { role: "system", content: systemPrompt },
      ...previousMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    await ChatMessage.create({
      userId,
      conversationId: chatConversationId,
      role: "user",
      content: message,
    });

    const chatCompletion = await client.chat.completions.create({
      model: "openai/gpt-oss-120b:groq",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const assistantMessage = chatCompletion.choices[0].message.content;

    await ChatMessage.create({
      userId,
      conversationId: chatConversationId,
      role: "assistant",
      content: assistantMessage,
    });

    res.json({
      message: assistantMessage,
      conversationId: chatConversationId,
      role: user.role,
    });
  } catch (error) {
    console.error("AI Chat error:", error);
    res.status(500).json({ 
      error: "Failed to process chat message",
      details: error.message 
    });
  }
});

router.get("/history/:conversationId", authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const messages = await ChatMessage.findAll({
      where: {
        userId,
        conversationId,
      },
      order: [["createdAt", "ASC"]],
    });

    res.json({ messages });
  } catch (error) {
    console.error("Chat history error:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

router.get("/conversations", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await ChatMessage.findAll({
      where: { userId },
      attributes: [
        "conversationId",
        [require("sequelize").fn("MAX", require("sequelize").col("created_at")), "lastMessageAt"],
        [require("sequelize").fn("COUNT", require("sequelize").col("id")), "messageCount"],
      ],
      group: ["conversationId"],
      order: [[require("sequelize").literal("lastMessageAt"), "DESC"]],
    });

    const conversationsWithPreview = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await ChatMessage.findOne({
          where: {
            userId,
            conversationId: conv.conversationId,
          },
          order: [["createdAt", "DESC"]],
        });

        return {
          conversationId: conv.conversationId,
          lastMessageAt: conv.dataValues.lastMessageAt,
          messageCount: conv.dataValues.messageCount,
          lastMessagePreview: lastMessage ? lastMessage.content.substring(0, 100) : "",
        };
      })
    );

    res.json({ conversations: conversationsWithPreview });
  } catch (error) {
    console.error("Conversations list error:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

router.delete("/conversation/:conversationId", authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    await ChatMessage.destroy({
      where: {
        userId,
        conversationId,
      },
    });

    res.json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Delete conversation error:", error);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

module.exports = router;
