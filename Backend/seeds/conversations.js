const { User, PropertyListing, Conversation, Message } = require("../models");

/**
 * Seed conversations and messages between students and landlords
 */
const seedConversations = async () => {
    try {
        // Get students
        const students = await User.findAll({
            where: { role: "Student" },
        });

        if (students.length === 0) {
            console.log("No students found. Please run student users seed first.");
            return;
        }

        // Get landlords
        const landlords = await User.findAll({
            where: { role: "Landlord" },
        });

        if (landlords.length === 0) {
            console.log("No landlords found. Please run landlords seed first.");
            return;
        }

        // Get property listings
        const properties = await PropertyListing.findAll();

        if (properties.length === 0) {
            console.log("No properties found. Please run property listings seed first.");
            return;
        }

        // Conversation templates with realistic message exchanges
        const conversationTemplates = [
            {
                messages: [
                    { fromStudent: true, content: "Hello! I saw your listing for the apartment near campus. Is it still available?" },
                    { fromStudent: false, content: "Hi! Yes, the apartment is still available. Are you interested in scheduling a viewing?" },
                    { fromStudent: true, content: "Yes, I'd love to see it! When would be a good time?" },
                    { fromStudent: false, content: "I'm available this Saturday between 10am and 2pm, or Sunday afternoon. What works for you?" },
                    { fromStudent: true, content: "Saturday at 11am would be perfect. Can you send me the exact address?" },
                    { fromStudent: false, content: "Great! The address is [Building Name], 3rd floor, Apartment 5. I'll meet you at the building entrance." },
                    { fromStudent: true, content: "Thank you! See you on Saturday." },
                ],
            },
            {
                messages: [
                    { fromStudent: true, content: "Hi, I'm interested in the studio apartment. A few questions: Is WiFi included? And is there parking available?" },
                    { fromStudent: false, content: "Hello! WiFi is included in the rent. There's street parking available, but no dedicated parking spot. The area is usually not too crowded though." },
                    { fromStudent: true, content: "That sounds good. What about utilities - are they included or separate?" },
                    { fromStudent: false, content: "Electricity and water are separate, usually around 150-200 NIS per month depending on usage. Internet and building maintenance are included." },
                    { fromStudent: true, content: "Understood. Is the apartment available for a 6-month lease? I only need it for one semester." },
                    { fromStudent: false, content: "I prefer yearly leases, but I can do 6 months with a slightly higher monthly rate. Would 1350 NIS work for you?" },
                    { fromStudent: true, content: "Let me think about it and get back to you. Thanks for the information!" },
                    { fromStudent: false, content: "No problem, take your time. Let me know if you have any other questions." },
                ],
            },
            {
                messages: [
                    { fromStudent: true, content: "Good evening! I'm looking for housing for next semester. Is your 2-bedroom apartment still available?" },
                    { fromStudent: false, content: "Good evening! Yes, it's available starting next month. Are you looking to rent alone or with a roommate?" },
                    { fromStudent: true, content: "With a roommate. We're both engineering students at An-Najah." },
                    { fromStudent: false, content: "Perfect, that works well. The apartment is very popular with students. Would you like to schedule a visit?" },
                    { fromStudent: true, content: "Yes please! Also, is the furniture included as shown in the photos?" },
                    { fromStudent: false, content: "Yes, everything in the photos is included - beds, desks, wardrobes, and kitchen appliances. You just need to bring your personal items." },
                    { fromStudent: true, content: "That's great! Can we visit tomorrow afternoon?" },
                    { fromStudent: false, content: "Tomorrow works. How about 4pm?" },
                    { fromStudent: true, content: "Perfect, we'll be there. Thank you!" },
                ],
            },
            {
                messages: [
                    { fromStudent: true, content: "Hello, I have a question about the room you're renting. You mentioned shared facilities - how many people share the bathroom?" },
                    { fromStudent: false, content: "Hi! There are 2 bathrooms in the apartment shared between 3 tenants. So it's usually not crowded." },
                    { fromStudent: true, content: "That's reasonable. What about the kitchen? Is there enough storage space for everyone?" },
                    { fromStudent: false, content: "Yes, each tenant has their own cabinet and fridge shelf. There's also a shared pantry for common items." },
                    { fromStudent: true, content: "Sounds organized! One more thing - what are the current tenants like? I want to make sure it's a good fit." },
                    { fromStudent: false, content: "They're both university students, very respectful and quiet. One is in her final year of pharmacy, the other is a master's student in chemistry." },
                    { fromStudent: true, content: "That sounds like a good environment for studying. I'd like to move forward with viewing the room." },
                ],
            },
            {
                messages: [
                    { fromStudent: true, content: "Hi! I noticed your listing says 'no pets allowed'. I have a small fish tank - would that be okay?" },
                    { fromStudent: false, content: "Hello! A fish tank should be fine, that's not really what I meant by pets 😊 I was referring to cats and dogs mainly." },
                    { fromStudent: true, content: "Great, thank you for clarifying! The apartment looks perfect for my needs." },
                    { fromStudent: false, content: "Glad to hear it! When would you like to come see it?" },
                    { fromStudent: true, content: "Is this weekend possible? I'm free both days." },
                    { fromStudent: false, content: "Saturday morning works best for me. Around 10am?" },
                    { fromStudent: true, content: "See you then!" },
                ],
            },
            {
                messages: [
                    { fromStudent: true, content: "Salam! I'm very interested in your apartment. I have a few questions about the lease terms." },
                    { fromStudent: false, content: "Wa alaikum assalam! Of course, what would you like to know?" },
                    { fromStudent: true, content: "What's the deposit amount, and when is it returned?" },
                    { fromStudent: false, content: "The deposit is one month's rent. It's returned within 2 weeks of moving out, assuming no damages beyond normal wear." },
                    { fromStudent: true, content: "That's fair. And what's the notice period if I need to leave early?" },
                    { fromStudent: false, content: "I require 30 days notice. If you need to break the lease early, we can discuss finding a replacement tenant." },
                    { fromStudent: true, content: "I appreciate the flexibility. Can I visit the apartment this week?" },
                    { fromStudent: false, content: "Absolutely! I'm available Wednesday or Thursday evening. Which works better?" },
                    { fromStudent: true, content: "Wednesday at 6pm would be great." },
                    { fromStudent: false, content: "Perfect, I'll send you the location. See you then!" },
                ],
            },
            {
                messages: [
                    { fromStudent: true, content: "Hello! Quick question - is the apartment still available? I need to move in urgently." },
                    { fromStudent: false, content: "Hi! Yes, it's available. How soon do you need to move in?" },
                    { fromStudent: true, content: "Within the next week if possible. My current place has some issues." },
                    { fromStudent: false, content: "That can be arranged. The apartment is ready for immediate move-in. Can you come see it today or tomorrow?" },
                    { fromStudent: true, content: "Today would be amazing! What time works for you?" },
                    { fromStudent: false, content: "I can meet you there at 5pm. Does that work?" },
                    { fromStudent: true, content: "Yes! Thank you so much for accommodating my situation." },
                    { fromStudent: false, content: "No problem at all. See you at 5pm. I'll send you the address now." },
                ],
            },
            {
                messages: [
                    { fromStudent: true, content: "Hi, I visited your apartment last week and I'm ready to proceed. What are the next steps?" },
                    { fromStudent: false, content: "Great news! I'll need a copy of your student ID, and we can sign the lease agreement. When can you come by?" },
                    { fromStudent: true, content: "I can come tomorrow. Should I bring the deposit as well?" },
                    { fromStudent: false, content: "Yes, please bring the deposit and first month's rent. Cash or bank transfer both work." },
                    { fromStudent: true, content: "I'll do a bank transfer. Can you send me your account details?" },
                    { fromStudent: false, content: "I'll send them via WhatsApp. Once I confirm the transfer, we can sign the contract and I'll give you the keys." },
                    { fromStudent: true, content: "Perfect! Looking forward to moving in." },
                    { fromStudent: false, content: "Welcome to the building! Let me know if you need any help settling in." },
                ],
            },
        ];

        let conversationCount = 0;
        let messageCount = 0;

        // Create conversations between random students and landlords
        for (let i = 0; i < Math.min(conversationTemplates.length, properties.length); i++) {
            const student = students[i % students.length];
            const property = properties[i];
            
            // Find the landlord who owns this property
            const landlord = landlords.find(l => {
                // We need to check via the listing
                return true; // For simplicity, just use round-robin
            }) || landlords[i % landlords.length];

            // Check if conversation already exists
            const existingConversation = await Conversation.findOne({
                where: {
                    studentId: student.id,
                    landlordId: landlord.id,
                    propertyId: property.id,
                },
            });

            if (existingConversation) {
                console.log(`Conversation already exists between ${student.firstName} and ${landlord.firstName}`);
                continue;
            }

            const template = conversationTemplates[i % conversationTemplates.length];
            const now = new Date();

            // Create conversation
            const conversation = await Conversation.create({
                studentId: student.id,
                landlordId: landlord.id,
                propertyId: property.id,
                lastMessageAt: now,
                studentLastReadAt: now,
                landlordLastReadAt: new Date(now.getTime() - 3600000), // 1 hour ago
            });

            conversationCount++;

            // Create messages with realistic timestamps
            let messageTime = new Date(now.getTime() - template.messages.length * 3600000); // Start from hours ago

            for (const msg of template.messages) {
                const senderId = msg.fromStudent ? student.id : landlord.id;

                await Message.create({
                    conversationId: conversation.id,
                    senderId: senderId,
                    content: msg.content,
                    createdAt: messageTime,
                    updatedAt: messageTime,
                });

                messageCount++;
                // Add random time between messages (15 min to 2 hours)
                messageTime = new Date(messageTime.getTime() + (Math.random() * 6300000 + 900000));
            }

            console.log(`Created conversation between ${student.firstName} and ${landlord.firstName}`);
        }

        console.log(`Created ${conversationCount} conversations with ${messageCount} messages`);
        console.log("Conversations seeding completed");
    } catch (error) {
        console.error("Error seeding conversations:", error);
        throw error;
    }
};

module.exports = seedConversations;
