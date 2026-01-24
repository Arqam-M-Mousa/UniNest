const { User, Listing, ItemListing } = require("../models");

/**
 * Seed item listings (marketplace items for students)
 */
const seedItemListings = async () => {
    try {
        // Get students
        const students = await User.findAll({
            where: { role: "Student" },
        });

        if (students.length === 0) {
            console.log("No students found. Please run student users seed first.");
            return;
        }

        const items = [
            // Furniture
            {
                listing: {
                    type: "Item",
                    title: "IKEA Study Desk - Like New",
                    description: "Selling my IKEA MICKE desk. Used for one semester only. White color, 105x50cm. Has cable management hole and drawer. Perfect for student room. Pick up from Nablus.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 45,
                },
                item: {
                    price: 250,
                    currency: "NIS",
                    condition: "like_new",
                    category: "furniture",
                    contactPhone: "+970599111222",
                    contactEmail: "seller1@stu.najah.edu",
                },
            },
            {
                listing: {
                    type: "Item",
                    title: "Comfortable Office Chair",
                    description: "Ergonomic office chair with lumbar support. Adjustable height and armrests. Black mesh back. Great for long study sessions. Minor wear on armrests.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 67,
                },
                item: {
                    price: 180,
                    currency: "NIS",
                    condition: "good",
                    category: "furniture",
                    contactPhone: "+970598222333",
                },
            },
            {
                listing: {
                    type: "Item",
                    title: "Single Bed with Mattress",
                    description: "Wooden single bed frame with comfortable mattress included. 90x200cm. Moving out and need to sell quickly. Can deliver within Nablus for extra 50 NIS.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 89,
                },
                item: {
                    price: 400,
                    currency: "NIS",
                    condition: "good",
                    category: "furniture",
                    contactPhone: "+970597333444",
                },
            },
            {
                listing: {
                    type: "Item",
                    title: "Bookshelf - 5 Shelves",
                    description: "Tall bookshelf with 5 adjustable shelves. Dark brown wood finish. Perfect for textbooks and decorations. Dimensions: 180cm H x 80cm W x 30cm D.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 34,
                },
                item: {
                    price: 150,
                    currency: "NIS",
                    condition: "good",
                    category: "furniture",
                    contactPhone: "+970596444555",
                },
            },
            // Electronics
            {
                listing: {
                    type: "Item",
                    title: "HP Laptop - Great for Students",
                    description: "HP Pavilion laptop, Intel i5, 8GB RAM, 256GB SSD. Windows 11. Battery lasts 5-6 hours. Includes charger and laptop bag. Perfect for coursework and light gaming.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 156,
                },
                item: {
                    price: 1800,
                    currency: "NIS",
                    condition: "good",
                    category: "electronics",
                    contactPhone: "+970595555666",
                    contactEmail: "techseller@gmail.com",
                },
            },
            {
                listing: {
                    type: "Item",
                    title: "Samsung 24\" Monitor",
                    description: "Samsung 24-inch Full HD monitor. Great colors and viewing angles. Has HDMI and VGA ports. Includes stand and power cable. No dead pixels.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 78,
                },
                item: {
                    price: 450,
                    currency: "NIS",
                    condition: "like_new",
                    category: "electronics",
                    contactPhone: "+970594666777",
                },
            },
            {
                listing: {
                    type: "Item",
                    title: "Wireless Keyboard and Mouse Combo",
                    description: "Logitech MK270 wireless keyboard and mouse combo. Brand new, still in box. Never opened. Got it as a gift but already have one.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 42,
                },
                item: {
                    price: 120,
                    currency: "NIS",
                    condition: "new",
                    category: "electronics",
                    contactPhone: "+970593777888",
                },
            },
            {
                listing: {
                    type: "Item",
                    title: "Scientific Calculator - TI-84",
                    description: "Texas Instruments TI-84 Plus graphing calculator. Essential for engineering and math courses. Works perfectly. Includes USB cable for updates.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 93,
                },
                item: {
                    price: 350,
                    currency: "NIS",
                    condition: "good",
                    category: "electronics",
                    contactPhone: "+970592888999",
                },
            },
            // Books
            {
                listing: {
                    type: "Item",
                    title: "Engineering Mathematics Textbook",
                    description: "Advanced Engineering Mathematics by Erwin Kreyszig, 10th Edition. Some highlighting but all pages intact. Required for many engineering courses.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 67,
                },
                item: {
                    price: 80,
                    currency: "NIS",
                    condition: "good",
                    category: "books",
                    contactEmail: "bookworm@stu.najah.edu",
                },
            },
            {
                listing: {
                    type: "Item",
                    title: "Computer Science Textbook Bundle",
                    description: "Selling 5 CS textbooks together: Data Structures, Algorithms, Database Systems, Operating Systems, and Computer Networks. All in good condition.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 112,
                },
                item: {
                    price: 300,
                    currency: "NIS",
                    condition: "good",
                    category: "books",
                    contactPhone: "+970591999000",
                },
            },
            {
                listing: {
                    type: "Item",
                    title: "Arabic-English Dictionary",
                    description: "Hans Wehr Arabic-English Dictionary, 4th Edition. The standard reference for Arabic students. Hardcover, excellent condition.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 28,
                },
                item: {
                    price: 60,
                    currency: "NIS",
                    condition: "like_new",
                    category: "books",
                    contactPhone: "+970599000111",
                },
            },
            // Kitchenware
            {
                listing: {
                    type: "Item",
                    title: "Mini Fridge - Perfect for Dorm",
                    description: "Compact mini fridge, 50L capacity. Has small freezer compartment. White color. Works great, very quiet. Ideal for keeping snacks and drinks cold.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 134,
                },
                item: {
                    price: 350,
                    currency: "NIS",
                    condition: "good",
                    category: "kitchenware",
                    contactPhone: "+970598111222",
                },
            },
            {
                listing: {
                    type: "Item",
                    title: "Electric Kettle + Toaster Set",
                    description: "Matching stainless steel electric kettle and 2-slice toaster. Both work perfectly. Selling together as a set. Great for quick breakfast.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 56,
                },
                item: {
                    price: 100,
                    currency: "NIS",
                    condition: "good",
                    category: "kitchenware",
                    contactPhone: "+970597222333",
                },
            },
            {
                listing: {
                    type: "Item",
                    title: "Complete Cookware Set",
                    description: "Non-stick cookware set: 2 pots, 2 pans, and lids. Used for one year. Still in great condition. Perfect starter set for student apartment.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 71,
                },
                item: {
                    price: 200,
                    currency: "NIS",
                    condition: "good",
                    category: "kitchenware",
                    contactPhone: "+970596333444",
                },
            },
            // Sports
            {
                listing: {
                    type: "Item",
                    title: "Mountain Bike - 21 Speed",
                    description: "Trek mountain bike, 21-speed Shimano gears. Great for commuting to campus. Recently serviced with new brakes. Includes lock and lights.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 98,
                },
                item: {
                    price: 800,
                    currency: "NIS",
                    condition: "good",
                    category: "sports",
                    contactPhone: "+970595444555",
                },
            },
            {
                listing: {
                    type: "Item",
                    title: "Yoga Mat and Accessories",
                    description: "Premium yoga mat (6mm thick) with carrying strap, 2 yoga blocks, and resistance band. Used only a few times. Perfect for home workouts.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 39,
                },
                item: {
                    price: 80,
                    currency: "NIS",
                    condition: "like_new",
                    category: "sports",
                    contactPhone: "+970594555666",
                },
            },
            {
                listing: {
                    type: "Item",
                    title: "Dumbbells Set - 2x10kg",
                    description: "Pair of 10kg rubber-coated dumbbells. Great for home gym. No rust or damage. Can negotiate price for serious buyers.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 52,
                },
                item: {
                    price: 150,
                    currency: "NIS",
                    condition: "good",
                    category: "sports",
                    contactPhone: "+970593666777",
                },
            },
            // Clothing
            {
                listing: {
                    type: "Item",
                    title: "Winter Jacket - Size L",
                    description: "Warm winter jacket, waterproof and windproof. Navy blue color, size Large. Worn only one season. Perfect for cold Nablus winters.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 44,
                },
                item: {
                    price: 200,
                    currency: "NIS",
                    condition: "like_new",
                    category: "clothing",
                    contactPhone: "+970592777888",
                },
            },
            // Other
            {
                listing: {
                    type: "Item",
                    title: "Desk Lamp with USB Port",
                    description: "LED desk lamp with adjustable brightness and color temperature. Has USB charging port. Touch controls. Modern design, white color.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 63,
                },
                item: {
                    price: 70,
                    currency: "NIS",
                    condition: "like_new",
                    category: "other",
                    contactPhone: "+970591888999",
                },
            },
            {
                listing: {
                    type: "Item",
                    title: "Portable Air Conditioner",
                    description: "Small portable AC unit, perfect for single room. 9000 BTU. Includes window kit and remote control. Saved me during summer exams!",
                    isActive: true,
                    isPublished: true,
                    viewCount: 187,
                },
                item: {
                    price: 900,
                    currency: "NIS",
                    condition: "good",
                    category: "other",
                    contactPhone: "+970599999000",
                },
            },
        ];

        let studentIndex = 0;
        for (const item of items) {
            // Check if listing with same title exists
            const existingListing = await Listing.findOne({
                where: { title: item.listing.title },
            });

            if (existingListing) {
                console.log(`Item "${item.listing.title}" already exists`);
                continue;
            }

            // Assign student in round-robin fashion
            const student = students[studentIndex % students.length];
            studentIndex++;

            // Create listing
            const listing = await Listing.create({
                ...item.listing,
                ownerId: student.id,
            });

            // Create item listing
            await ItemListing.create({
                ...item.item,
                listingId: listing.id,
            });

            console.log(`Created item: ${item.listing.title}`);
        }

        console.log("Item listings seeding completed");
    } catch (error) {
        console.error("Error seeding item listings:", error);
        throw error;
    }
};

module.exports = seedItemListings;
