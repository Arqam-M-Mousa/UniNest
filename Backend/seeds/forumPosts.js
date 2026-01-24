const { User, ForumPost, ForumComment, ForumLike } = require("../models");

/**
 * Seed forum posts, comments, and likes
 */
const seedForumPosts = async () => {
    try {
        // Get all users (students and landlords can post)
        const users = await User.findAll({
            where: { role: ["Student", "Landlord"] },
        });

        if (users.length === 0) {
            console.log("No users found. Please run user seeds first.");
            return;
        }

        const posts = [
            // Housing category
            {
                title: "Tips for Finding Affordable Housing Near An-Najah",
                content: `Hey everyone! I've been searching for housing near An-Najah for a few weeks now and wanted to share some tips that helped me:

1. **Start early** - Begin your search at least 2 months before the semester starts
2. **Check the bulletin boards** - Both physical ones on campus and online groups
3. **Consider sharing** - Splitting a 2-bedroom apartment is often cheaper than a studio
4. **Negotiate** - Landlords are often willing to negotiate, especially for longer leases
5. **Visit in person** - Photos can be deceiving, always see the place before signing

What tips do you all have? Would love to hear from others!`,
                category: "Housing",
                isPinned: true,
                viewCount: 342,
            },
            {
                title: "Is Rafidia a good area for students?",
                content: `I'm considering renting an apartment in Rafidia. For those who live or have lived there:

- How's the commute to campus?
- Is it safe at night?
- Are there good restaurants and shops nearby?
- What's the average rent for a 1-bedroom?

Thanks in advance for any info!`,
                category: "Housing",
                viewCount: 187,
            },
            {
                title: "Warning: Avoid this landlord!",
                content: `I want to warn fellow students about a bad experience I had. Without naming names (mods can remove if not allowed), I rented from someone who:

- Didn't return my deposit despite leaving the place spotless
- Entered the apartment without notice multiple times
- Refused to fix the broken heater for 2 months

Always get everything in writing and take photos when you move in! Learn from my mistake.`,
                category: "Housing",
                viewCount: 456,
            },
            // Roommates category
            {
                title: "Looking for a Female Roommate - Near Campus",
                content: `Hi! I'm a 3rd year Computer Science student looking for a female roommate to share a 2-bedroom apartment near the old campus.

**About the apartment:**
- 5 min walk to campus
- Fully furnished
- Rent: 1100 NIS each (utilities included)
- Available from next month

**About me:**
- Clean and organized
- Quiet, prefer studying at home
- Non-smoker
- Early sleeper (usually by 11pm)

If you're interested or have questions, feel free to message me!`,
                category: "Roommates",
                viewCount: 234,
            },
            {
                title: "Roommate Compatibility - What matters most?",
                content: `Starting a discussion: What do you think is the most important factor when choosing a roommate?

For me, it's definitely **sleep schedule**. I learned the hard way that living with a night owl when you're an early bird is a recipe for disaster.

What's your deal-breaker when it comes to roommates?`,
                category: "Roommates",
                viewCount: 156,
            },
            // University category
            {
                title: "Best Study Spots on Campus?",
                content: `Now that midterms are approaching, I need to find good places to study. The library is always packed!

Where do you guys go to study? Looking for:
- Quiet places
- Good WiFi
- Maybe somewhere I can grab coffee

Share your secret spots! (Or maybe don't so they stay empty 😅)`,
                category: "University",
                viewCount: 289,
            },
            {
                title: "Transportation from Ramallah to Campus",
                content: `I'm living in Ramallah this semester and commuting to An-Najah. Looking for advice on:

1. Best bus routes/times?
2. Anyone interested in carpooling?
3. Approximate monthly transportation cost?

The commute is killing me and my wallet. Any tips appreciated!`,
                category: "University",
                viewCount: 198,
            },
            // Tips category
            {
                title: "Money-Saving Tips for Students",
                content: `Let's share our best money-saving tips! Here are mine:

💰 **Food:**
- Cook at home - way cheaper than eating out
- Buy groceries from the local market, not supermarkets
- Meal prep on weekends

💰 **Utilities:**
- Turn off lights and unplug devices
- Use natural light when possible
- Layer up instead of cranking the heat

💰 **Transportation:**
- Walk when possible
- Share rides with classmates
- Get a monthly bus pass

What are your tips?`,
                category: "Tips",
                isPinned: true,
                viewCount: 567,
            },
            {
                title: "How to Deal with Noisy Neighbors",
                content: `My neighbors are SO LOUD. Music until 2am, loud conversations, you name it. I've tried:

- Talking to them nicely ❌
- Leaving a note ❌
- Earplugs (help a little) ✓
- White noise machine ✓

Has anyone successfully dealt with this? Should I involve the landlord? I don't want to be "that person" but I have exams coming up!`,
                category: "Tips",
                viewCount: 234,
            },
            // Questions category
            {
                title: "How does the deposit system work?",
                content: `First time renting and I'm confused about deposits. Can someone explain:

1. How much is typical? (I've heard 1-2 months rent)
2. When do you get it back?
3. What can landlords deduct from it?
4. Should I get a receipt?

Don't want to get scammed. Thanks!`,
                category: "Questions",
                viewCount: 312,
            },
            {
                title: "Lease Agreement - What to Look For?",
                content: `I'm about to sign my first lease and want to make sure I don't miss anything important. What should I look for in the agreement?

Also, is it normal for landlords to ask for post-dated checks? That seems risky to me.`,
                category: "Questions",
                viewCount: 178,
            },
            {
                title: "Internet Providers - Which is Best?",
                content: `Moving into a new apartment and need to set up internet. Which provider do you recommend for:
- Reliability
- Speed
- Price
- Customer service

I mainly need it for online classes and some gaming. Thanks!`,
                category: "Questions",
                viewCount: 145,
            },
            // General category
            {
                title: "Welcome New Students! Introduce Yourself",
                content: `Hey everyone! With the new semester starting, let's welcome all the new students to our community! 🎉

Feel free to introduce yourself:
- What are you studying?
- Where are you from?
- What are you looking for? (housing, roommates, tips, etc.)

We're here to help each other out. Don't be shy!`,
                category: "General",
                isPinned: true,
                viewCount: 892,
            },
            {
                title: "Weekend Activities Around Nablus",
                content: `Looking for things to do on weekends. I've been here for a month and mostly just studied 📚

What do you guys do for fun? Any recommendations for:
- Cafes with good atmosphere
- Hiking spots
- Places to hang out with friends
- Cultural activities

Help a bored student out!`,
                category: "General",
                viewCount: 267,
            },
            {
                title: "Student Discounts - Share What You Know!",
                content: `Let's compile a list of places that offer student discounts! I'll start:

- **City Cafe** - 10% off with student ID
- **Tech Store on Main St** - 5% off electronics
- **Local Gym** - Student membership rate

Add to the list! 📝`,
                category: "General",
                viewCount: 423,
            },
        ];

        const commentTemplates = [
            "Great post! This is really helpful, thanks for sharing.",
            "I had a similar experience. Totally agree with your points.",
            "Thanks for the tips! I'll definitely try this.",
            "Can you share more details about this?",
            "This is exactly what I was looking for!",
            "I disagree with some points, but overall good advice.",
            "Bumping this because more people need to see it.",
            "Has anyone else tried this? Did it work for you?",
            "Following this thread for updates!",
            "This should be pinned! Very useful information.",
            "I wish I knew this before I signed my lease 😅",
            "Adding to this: also check the water pressure before renting!",
            "Great question! I'd like to know too.",
            "In my experience, this really depends on the landlord.",
            "Pro tip: always take photos of everything when you move in!",
            "The market near the old campus has the best prices.",
            "I recommend talking to senior students, they know all the tricks.",
            "This worked for me! Highly recommend.",
            "Be careful with this advice, it might not work everywhere.",
            "Thanks for the warning, I'll keep this in mind.",
        ];

        let postCount = 0;
        let commentCount = 0;
        let likeCount = 0;

        for (const postData of posts) {
            // Check if post with same title exists
            const existingPost = await ForumPost.findOne({
                where: { title: postData.title },
            });

            if (existingPost) {
                console.log(`Post "${postData.title}" already exists`);
                continue;
            }

            // Pick a random user as author
            const author = users[Math.floor(Math.random() * users.length)];

            const post = await ForumPost.create({
                ...postData,
                userId: author.id,
                isPinned: postData.isPinned || false,
                isLocked: false,
            });

            postCount++;

            // Add 2-6 comments per post
            const numComments = Math.floor(Math.random() * 5) + 2;
            for (let i = 0; i < numComments; i++) {
                const commenter = users[Math.floor(Math.random() * users.length)];
                const commentText = commentTemplates[Math.floor(Math.random() * commentTemplates.length)];

                await ForumComment.create({
                    postId: post.id,
                    userId: commenter.id,
                    content: commentText,
                });
                commentCount++;
            }

            // Add 5-20 likes per post
            const numLikes = Math.floor(Math.random() * 16) + 5;
            const likedUserIds = new Set();

            for (let i = 0; i < numLikes && likedUserIds.size < users.length; i++) {
                const liker = users[Math.floor(Math.random() * users.length)];

                if (likedUserIds.has(liker.id)) continue;
                likedUserIds.add(liker.id);

                await ForumLike.create({
                    postId: post.id,
                    userId: liker.id,
                });
                likeCount++;
            }

            console.log(`Created post: ${postData.title}`);
        }

        console.log(`Created ${postCount} posts, ${commentCount} comments, ${likeCount} likes`);
        console.log("Forum posts seeding completed");
    } catch (error) {
        console.error("Error seeding forum posts:", error);
        throw error;
    }
};

module.exports = seedForumPosts;
