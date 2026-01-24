const { User, Listing, PropertyListing, Review } = require("../models");

/**
 * Seed reviews for listings and landlords
 */
const seedReviews = async () => {
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

        // Get property listings with their base listings
        const propertyListings = await PropertyListing.findAll({
            include: [{ model: Listing, as: "listing" }],
        });

        if (propertyListings.length === 0) {
            console.log("No property listings found. Please run property listings seed first.");
            return;
        }

        const reviewTemplates = [
            // 5-star reviews
            {
                rating: 5,
                title: "Excellent place to live!",
                comment: "I had an amazing experience living here. The apartment was exactly as described, clean, and well-maintained. The landlord was very responsive and helpful whenever I had questions or issues.",
                pros: "Great location, clean, responsive landlord, all amenities work perfectly",
                cons: "None really, maybe parking could be easier",
            },
            {
                rating: 5,
                title: "Perfect for students",
                comment: "This is the ideal student accommodation. Close to university, quiet neighborhood, and affordable rent. I renewed my lease for another year!",
                pros: "Walking distance to campus, quiet for studying, good internet",
                cons: "Elevator can be slow during peak hours",
            },
            {
                rating: 5,
                title: "Highly recommend!",
                comment: "Best rental experience I've had. The place is modern, comfortable, and the landlord treats tenants with respect. Maintenance requests are handled within 24 hours.",
                pros: "Modern appliances, fast maintenance, fair rent",
                cons: "Street can be noisy on weekends",
            },
            // 4-star reviews
            {
                rating: 4,
                title: "Great value for money",
                comment: "Very satisfied with my stay. The apartment is spacious and well-furnished. Only minor issue was the hot water taking a while to heat up in winter.",
                pros: "Spacious rooms, good furniture, nice neighbors",
                cons: "Hot water heater could be better, some paint chipping",
            },
            {
                rating: 4,
                title: "Good experience overall",
                comment: "The property met my expectations. Location is convenient and the landlord is professional. A few small repairs were needed but were addressed eventually.",
                pros: "Central location, professional landlord, secure building",
                cons: "Some repairs took longer than expected",
            },
            {
                rating: 4,
                title: "Comfortable and convenient",
                comment: "Lived here for a full academic year. The apartment served me well for studying and daily life. Would recommend to other students looking in this area.",
                pros: "Good study environment, reliable utilities, fair price",
                cons: "Kitchen appliances are a bit dated",
            },
            {
                rating: 4,
                title: "Solid choice for students",
                comment: "Clean apartment in a good location. The landlord is friendly and understanding about student schedules. Minor issues with heating in winter but manageable.",
                pros: "Clean, good location, understanding landlord",
                cons: "Heating system needs upgrade",
            },
            // 3-star reviews
            {
                rating: 3,
                title: "Average but acceptable",
                comment: "The apartment is okay for the price. Nothing special but nothing terrible either. Had some issues with neighbors being loud but landlord tried to help.",
                pros: "Affordable rent, decent size",
                cons: "Noisy neighbors, older building, limited parking",
            },
            {
                rating: 3,
                title: "Mixed feelings",
                comment: "The location is great but the apartment itself needs some updates. Landlord is nice but slow to respond to maintenance requests.",
                pros: "Great location, nice landlord",
                cons: "Slow maintenance, needs renovation, old appliances",
            },
            // Landlord-specific reviews
            {
                rating: 5,
                title: "Best landlord ever!",
                comment: "I've rented from several landlords during my university years, and this one is by far the best. Always professional, fair, and genuinely cares about tenants' wellbeing.",
                pros: "Professional, responsive, fair with deposits",
                cons: "None",
            },
            {
                rating: 4,
                title: "Reliable and fair",
                comment: "Good experience with this landlord. They maintain their properties well and are reasonable with rent increases. Communication could be a bit faster.",
                pros: "Well-maintained properties, fair pricing",
                cons: "Sometimes slow to respond to messages",
            },
            {
                rating: 4,
                title: "Professional landlord",
                comment: "Very professional approach to property management. Clear lease terms, proper documentation, and respects tenant privacy. Would rent from them again.",
                pros: "Professional, clear communication, respects privacy",
                cons: "Strict about lease terms",
            },
        ];

        let reviewCount = 0;
        const maxReviewsPerListing = 3;

        // Create reviews for property listings
        for (const propertyListing of propertyListings) {
            const listing = propertyListing.listing;
            if (!listing) continue;

            // Get the landlord for this listing
            const landlord = landlords.find(l => l.id === listing.ownerId);

            // Create 1-3 reviews per listing
            const numReviews = Math.floor(Math.random() * maxReviewsPerListing) + 1;

            for (let i = 0; i < numReviews; i++) {
                // Pick a random student
                const student = students[Math.floor(Math.random() * students.length)];

                // Check if this student already reviewed this listing
                const existingReview = await Review.findOne({
                    where: {
                        studentId: student.id,
                        listingId: listing.id,
                    },
                });

                if (existingReview) continue;

                // Pick a random review template
                const template = reviewTemplates[Math.floor(Math.random() * 9)]; // First 9 are listing reviews

                await Review.create({
                    targetType: "Listing",
                    rating: template.rating,
                    title: template.title,
                    comment: template.comment,
                    pros: template.pros,
                    cons: template.cons,
                    listingId: listing.id,
                    studentId: student.id,
                    landlordId: landlord?.id || null,
                });

                reviewCount++;
            }
        }

        // Create landlord-specific reviews
        for (const landlord of landlords) {
            // Create 2-4 reviews per landlord
            const numReviews = Math.floor(Math.random() * 3) + 2;

            for (let i = 0; i < numReviews; i++) {
                // Pick a random student
                const student = students[Math.floor(Math.random() * students.length)];

                // Check if this student already reviewed this landlord directly
                const existingReview = await Review.findOne({
                    where: {
                        studentId: student.id,
                        landlordId: landlord.id,
                        targetType: "Landlord",
                    },
                });

                if (existingReview) continue;

                // Pick a landlord review template
                const template = reviewTemplates[9 + Math.floor(Math.random() * 3)];

                await Review.create({
                    targetType: "Landlord",
                    rating: template.rating,
                    title: template.title,
                    comment: template.comment,
                    pros: template.pros,
                    cons: template.cons,
                    listingId: null,
                    studentId: student.id,
                    landlordId: landlord.id,
                });

                reviewCount++;
            }
        }

        console.log(`Created ${reviewCount} reviews`);
        console.log("Reviews seeding completed");
    } catch (error) {
        console.error("Error seeding reviews:", error);
        throw error;
    }
};

module.exports = seedReviews;
