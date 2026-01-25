const { ChatMessage } = require("../models");

async function seedChatMessages() {
  try {
    console.log("Seeding chat messages...");
    
    await ChatMessage.sync({ alter: true });
    
    console.log("✅ Chat messages table created/updated successfully");
  } catch (error) {
    console.error("❌ Error seeding chat messages:", error);
    throw error;
  }
}

module.exports = seedChatMessages;
