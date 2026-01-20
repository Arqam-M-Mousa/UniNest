const { User, University, Listing, PropertyListing } = require("../models");

/**
 * Seed property listings
 */
const seedPropertyListings = async () => {
    try {
        // Get landlords
        const landlords = await User.findAll({
            where: { role: "Landlord" },
        });

        if (landlords.length === 0) {
            console.log("No landlords found. Please run landlords seed first.");
            return;
        }

        // Get universities
        const universities = await University.findAll();

        if (universities.length === 0) {
            console.log("No universities found. Please run universities seed first.");
            return;
        }

        const najahUni = universities.find(u => u.domain === "najah.edu") || universities[0];
        const birzeitUni = universities.find(u => u.domain === "birzeit.edu") || universities[0];
        const qudsUni = universities.find(u => u.domain === "alquds.edu") || universities[0];
        const ppuUni = universities.find(u => u.domain === "ppu.edu") || universities[0];

        const properties = [
            // Nablus properties near An-Najah
            {
                listing: {
                    type: "Property",
                    title: "Modern Studio Apartment Near An-Najah",
                    description: "Fully furnished studio apartment, perfect for students. Features a modern kitchen, comfortable bed, study desk, and high-speed internet. Walking distance to An-Najah University campus. Utilities included in rent.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 156,
                },
                property: {
                    propertyType: "Studio",
                    pricePerMonth: 1200,
                    currency: "NIS",
                    city: "Nablus",
                    latitude: 32.2234,
                    longitude: 35.2567,
                    bedrooms: 1,
                    bathrooms: 1,
                    squareFeet: 450,
                    amenitiesJson: ["WiFi", "AC", "Heating", "Furnished", "Kitchen", "Laundry"],
                    distanceToUniversity: 0.5,
                    listingDuration: "3months",
                    leaseDuration: "1 year",
                    maxOccupants: 1,
                    universityId: najahUni.id,
                },
            },
            {
                listing: {
                    type: "Property",
                    title: "Spacious 2-Bedroom Apartment in Rafidia",
                    description: "Beautiful 2-bedroom apartment in the heart of Rafidia. Recently renovated with new appliances. Perfect for 2 students looking to share. Close to shops, restaurants, and public transportation.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 243,
                },
                property: {
                    propertyType: "Apartment",
                    pricePerMonth: 2200,
                    currency: "NIS",
                    city: "Nablus",
                    latitude: 32.2189,
                    longitude: 35.2412,
                    bedrooms: 2,
                    bathrooms: 1,
                    squareFeet: 850,
                    amenitiesJson: ["WiFi", "AC", "Heating", "Furnished", "Kitchen", "Balcony", "Parking"],
                    distanceToUniversity: 1.2,
                    listingDuration: "3months",
                    leaseDuration: "1 year",
                    maxOccupants: 2,
                    universityId: najahUni.id,
                },
            },
            {
                listing: {
                    type: "Property",
                    title: "Cozy Room in Shared House",
                    description: "Private room in a shared house with 2 other students. Shared kitchen and bathroom. Quiet neighborhood, great for studying. All utilities included.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 89,
                },
                property: {
                    propertyType: "Room",
                    pricePerMonth: 700,
                    currency: "NIS",
                    city: "Nablus",
                    latitude: 32.2256,
                    longitude: 35.2601,
                    bedrooms: 1,
                    bathrooms: 1,
                    squareFeet: 200,
                    amenitiesJson: ["WiFi", "Heating", "Shared Kitchen", "Laundry"],
                    distanceToUniversity: 0.8,
                    listingDuration: "2months",
                    leaseDuration: "6 months",
                    maxOccupants: 1,
                    universityId: najahUni.id,
                },
            },
            {
                listing: {
                    type: "Property",
                    title: "Luxury 3-Bedroom Apartment with View",
                    description: "Premium apartment with stunning city views. 3 spacious bedrooms, 2 full bathrooms, modern kitchen with all appliances. Building has 24/7 security and elevator. Ideal for a group of students.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 312,
                },
                property: {
                    propertyType: "Apartment",
                    pricePerMonth: 3500,
                    currency: "NIS",
                    city: "Nablus",
                    latitude: 32.2198,
                    longitude: 35.2523,
                    bedrooms: 3,
                    bathrooms: 2,
                    squareFeet: 1200,
                    amenitiesJson: ["WiFi", "AC", "Heating", "Furnished", "Kitchen", "Balcony", "Parking", "Elevator", "Security", "Gym"],
                    distanceToUniversity: 1.5,
                    listingDuration: "3months",
                    leaseDuration: "1 year",
                    maxOccupants: 4,
                    universityId: najahUni.id,
                },
            },
            // Birzeit properties
            {
                listing: {
                    type: "Property",
                    title: "Student-Friendly Apartment Near Birzeit",
                    description: "Affordable apartment perfect for Birzeit University students. 2 bedrooms, fully equipped kitchen, and a small balcony. Bus stop right outside the building.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 178,
                },
                property: {
                    propertyType: "Apartment",
                    pricePerMonth: 1800,
                    currency: "NIS",
                    city: "Birzeit",
                    latitude: 31.9589,
                    longitude: 35.1945,
                    bedrooms: 2,
                    bathrooms: 1,
                    squareFeet: 700,
                    amenitiesJson: ["WiFi", "Heating", "Furnished", "Kitchen", "Balcony"],
                    distanceToUniversity: 0.3,
                    listingDuration: "3months",
                    leaseDuration: "1 year",
                    maxOccupants: 2,
                    universityId: birzeitUni.id,
                },
            },
            {
                listing: {
                    type: "Property",
                    title: "Private Studio in Ramallah",
                    description: "Modern studio in central Ramallah with easy access to Birzeit University. Features include a murphy bed, kitchenette, and private bathroom. Building has rooftop terrace.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 201,
                },
                property: {
                    propertyType: "Studio",
                    pricePerMonth: 1500,
                    currency: "NIS",
                    city: "Ramallah",
                    latitude: 31.9038,
                    longitude: 35.2034,
                    bedrooms: 1,
                    bathrooms: 1,
                    squareFeet: 380,
                    amenitiesJson: ["WiFi", "AC", "Heating", "Furnished", "Kitchen"],
                    distanceToUniversity: 5.2,
                    listingDuration: "2months",
                    leaseDuration: "6 months",
                    maxOccupants: 1,
                    universityId: birzeitUni.id,
                },
            },
            // Jerusalem/Al-Quds properties
            {
                listing: {
                    type: "Property",
                    title: "Historic Old City Apartment",
                    description: "Unique apartment in the historic Old City area. Traditional architecture with modern amenities. 2 bedrooms with high ceilings and beautiful stonework.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 267,
                },
                property: {
                    propertyType: "Apartment",
                    pricePerMonth: 2800,
                    currency: "NIS",
                    city: "Jerusalem",
                    latitude: 31.7767,
                    longitude: 35.2345,
                    bedrooms: 2,
                    bathrooms: 1,
                    squareFeet: 750,
                    amenitiesJson: ["WiFi", "Heating", "Furnished", "Kitchen", "Historic Building"],
                    distanceToUniversity: 2.1,
                    listingDuration: "3months",
                    leaseDuration: "1 year",
                    maxOccupants: 2,
                    universityId: qudsUni.id,
                },
            },
            // Hebron properties
            {
                listing: {
                    type: "Property",
                    title: "Budget-Friendly Room Near PPU",
                    description: "Affordable private room close to Palestine Polytechnic University. Shared facilities with one other student. Quiet environment perfect for engineering students.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 134,
                },
                property: {
                    propertyType: "Room",
                    pricePerMonth: 600,
                    currency: "NIS",
                    city: "Hebron",
                    latitude: 31.5345,
                    longitude: 35.1012,
                    bedrooms: 1,
                    bathrooms: 1,
                    squareFeet: 180,
                    amenitiesJson: ["WiFi", "Heating", "Shared Kitchen", "Study Desk"],
                    distanceToUniversity: 0.4,
                    listingDuration: "1month",
                    leaseDuration: "Semester",
                    maxOccupants: 1,
                    universityId: ppuUni.id,
                },
            },
            {
                listing: {
                    type: "Property",
                    title: "Family House with Garden",
                    description: "Entire house available for rent. 4 bedrooms, 2 bathrooms, large living area, and a beautiful garden. Perfect for a group of students who want privacy and space.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 189,
                },
                property: {
                    propertyType: "House",
                    pricePerMonth: 4500,
                    currency: "NIS",
                    city: "Hebron",
                    latitude: 31.5289,
                    longitude: 35.0956,
                    bedrooms: 4,
                    bathrooms: 2,
                    squareFeet: 1800,
                    amenitiesJson: ["WiFi", "AC", "Heating", "Furnished", "Kitchen", "Garden", "Parking", "Laundry"],
                    distanceToUniversity: 1.8,
                    listingDuration: "3months",
                    leaseDuration: "1 year",
                    maxOccupants: 6,
                    universityId: ppuUni.id,
                },
            },
            {
                listing: {
                    type: "Property",
                    title: "New Construction Modern Flat",
                    description: "Brand new apartment in a newly constructed building. Never lived in before. Modern finishes, energy-efficient appliances, and smart home features.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 298,
                },
                property: {
                    propertyType: "Apartment",
                    pricePerMonth: 2400,
                    currency: "NIS",
                    city: "Nablus",
                    latitude: 32.2267,
                    longitude: 35.2489,
                    bedrooms: 2,
                    bathrooms: 1,
                    squareFeet: 900,
                    amenitiesJson: ["WiFi", "AC", "Heating", "Kitchen", "Balcony", "Elevator", "Smart Home", "New Construction"],
                    distanceToUniversity: 0.9,
                    listingDuration: "3months",
                    leaseDuration: "1 year",
                    maxOccupants: 3,
                    universityId: najahUni.id,
                },
            },
            {
                listing: {
                    type: "Property",
                    title: "Penthouse with Rooftop Access",
                    description: "Stunning penthouse apartment with private rooftop terrace. Panoramic views of the city. 3 bedrooms, 2 bathrooms, open-plan living and dining area.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 356,
                },
                property: {
                    propertyType: "Apartment",
                    pricePerMonth: 4200,
                    currency: "NIS",
                    city: "Ramallah",
                    latitude: 31.9056,
                    longitude: 35.2078,
                    bedrooms: 3,
                    bathrooms: 2,
                    squareFeet: 1400,
                    amenitiesJson: ["WiFi", "AC", "Heating", "Furnished", "Kitchen", "Rooftop", "Parking", "Elevator", "City View"],
                    distanceToUniversity: 6.5,
                    listingDuration: "3months",
                    leaseDuration: "1 year",
                    maxOccupants: 4,
                    universityId: birzeitUni.id,
                },
            },
            {
                listing: {
                    type: "Property",
                    title: "Economical Shared Apartment",
                    description: "Looking for roommates! 1 room available in a 3-bedroom apartment. Current tenants are university students. Friendly atmosphere and split utilities.",
                    isActive: true,
                    isPublished: true,
                    viewCount: 167,
                },
                property: {
                    propertyType: "Room",
                    pricePerMonth: 550,
                    currency: "NIS",
                    city: "Nablus",
                    latitude: 32.2201,
                    longitude: 35.2534,
                    bedrooms: 1,
                    bathrooms: 1,
                    squareFeet: 150,
                    amenitiesJson: ["WiFi", "Heating", "Shared Kitchen", "Shared Bathroom", "Laundry"],
                    distanceToUniversity: 0.6,
                    listingDuration: "1month",
                    leaseDuration: "Flexible",
                    maxOccupants: 1,
                    universityId: najahUni.id,
                },
            },
        ];

        let landlordIndex = 0;
        for (const prop of properties) {
            // Check if listing with same title exists
            const existingListing = await Listing.findOne({
                where: { title: prop.listing.title },
            });

            if (existingListing) {
                console.log(`Property "${prop.listing.title}" already exists`);
                continue;
            }

            // Assign landlord in round-robin fashion
            const landlord = landlords[landlordIndex % landlords.length];
            landlordIndex++;

            // Create listing
            const listing = await Listing.create({
                ...prop.listing,
                ownerId: landlord.id,
            });

            // Calculate expiry date based on listing duration
            const durationMap = {
                "1week": 7,
                "2weeks": 14,
                "1month": 30,
                "2months": 60,
                "3months": 90,
            };
            const days = durationMap[prop.property.listingDuration] || 30;
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + days);

            // Create property listing
            await PropertyListing.create({
                ...prop.property,
                listingId: listing.id,
                expiresAt,
                isVisible: true,
            });

            console.log(`Created property: ${prop.listing.title}`);
        }

        console.log("Property listings seeding completed");
    } catch (error) {
        console.error("Error seeding property listings:", error);
        throw error;
    }
};

module.exports = seedPropertyListings;
