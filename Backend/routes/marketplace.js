const express = require("express");
const { Op } = require("sequelize");
const {
    Listing,
    ItemListing,
    ListingImage,
    User,
} = require("../models");
const { authenticate, authorize } = require("../middleware/auth");
const { sendSuccess, sendError, HTTP_STATUS } = require("../utils/responses");

const router = express.Router();

// Middleware to block landlords from all marketplace routes
const blockLandlords = (req, res, next) => {
    if (req.user?.role === "Landlord") {
        return sendError(
            res,
            "Landlords cannot access the marketplace",
            HTTP_STATUS.FORBIDDEN
        );
    }
    next();
};

// GET /api/marketplace - List all marketplace items
router.get("/", async (req, res) => {
    try {
        const {
            category,
            condition,
            minPrice,
            maxPrice,
            search,
            sortBy = "createdAt",
            sortOrder = "DESC",
            limit = 20,
            offset = 0,
        } = req.query;

        const where = {
            type: "Item",
            isActive: true,
            isPublished: true,
        };

        if (search) {
            where[Op.or] = [
                { title: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } },
            ];
        }

        const itemWhere = {};
        if (category) itemWhere.category = category;
        if (condition) itemWhere.condition = condition;
        if (minPrice || maxPrice) {
            itemWhere.price = {};
            if (minPrice) itemWhere.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) itemWhere.price[Op.lte] = parseFloat(maxPrice);
        }

        const order = [[sortBy, sortOrder.toUpperCase()]];

        const total = await Listing.count({
            where,
            include: [
                {
                    model: ItemListing,
                    as: "itemDetails",
                    where: Object.keys(itemWhere).length > 0 ? itemWhere : undefined,
                    required: true,
                },
            ],
        });

        const listings = await Listing.findAll({
            where,
            include: [
                {
                    model: ItemListing,
                    as: "itemDetails",
                    where: Object.keys(itemWhere).length > 0 ? itemWhere : undefined,
                    required: true,
                },
                {
                    model: ListingImage,
                    as: "images",
                    attributes: ["id", "url", "isPrimary"],
                },
                {
                    model: User,
                    as: "owner",
                    attributes: ["id", "firstName", "lastName", "avatarUrl"],
                },
            ],
            order,
            limit: Math.min(parseInt(limit, 10), 50),
            offset: parseInt(offset, 10),
        });

        // Flatten the response
        const items = listings.map((listing) => ({
            id: listing.id,
            title: listing.title,
            description: listing.description,
            price: listing.itemDetails?.price,
            currency: listing.itemDetails?.currency,
            condition: listing.itemDetails?.condition,
            category: listing.itemDetails?.category,
            contactPhone: listing.itemDetails?.contactPhone,
            contactEmail: listing.itemDetails?.contactEmail,
            images: listing.images || [],
            owner: listing.owner,
            createdAt: listing.createdAt,
            updatedAt: listing.updatedAt,
        }));

        return sendSuccess(res, { items, total, limit: parseInt(limit, 10), offset: parseInt(offset, 10) });
    } catch (error) {
        console.error("Failed to fetch marketplace items", error);
        return sendError(res, "Failed to fetch marketplace items", HTTP_STATUS.SERVER_ERROR, error);
    }
});

// GET /api/marketplace/filter-options - Get filter options
router.get("/filter-options", async (req, res) => {
    try {
        const categories = ["furniture", "electronics", "books", "clothing", "kitchenware", "sports", "other"];
        const conditions = ["new", "like_new", "good", "fair"];

        // Get price range from existing items
        const priceRange = await ItemListing.findOne({
            attributes: [
                [require("sequelize").fn("MIN", require("sequelize").col("price")), "minPrice"],
                [require("sequelize").fn("MAX", require("sequelize").col("price")), "maxPrice"],
            ],
            raw: true,
        });

        return sendSuccess(res, {
            categories,
            conditions,
            priceRange: {
                min: priceRange?.minPrice || 0,
                max: priceRange?.maxPrice || 10000,
            },
        });
    } catch (error) {
        console.error("Failed to fetch filter options", error);
        return sendError(res, "Failed to fetch filter options", HTTP_STATUS.SERVER_ERROR, error);
    }
});

// GET /api/marketplace/my-items - Get current user's items
router.get("/my-items", authenticate, blockLandlords, async (req, res) => {
    try {
        const userId = req.user.id;

        const listings = await Listing.findAll({
            where: {
                ownerId: userId,
                type: "Item",
            },
            include: [
                {
                    model: ItemListing,
                    as: "itemDetails",
                    required: true,
                },
                {
                    model: ListingImage,
                    as: "images",
                    attributes: ["id", "url", "isPrimary"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        const items = listings.map((listing) => ({
            id: listing.id,
            title: listing.title,
            description: listing.description,
            isActive: listing.isActive,
            isPublished: listing.isPublished,
            price: listing.itemDetails?.price,
            currency: listing.itemDetails?.currency,
            condition: listing.itemDetails?.condition,
            category: listing.itemDetails?.category,
            contactPhone: listing.itemDetails?.contactPhone,
            contactEmail: listing.itemDetails?.contactEmail,
            images: listing.images || [],
            createdAt: listing.createdAt,
            updatedAt: listing.updatedAt,
        }));

        return sendSuccess(res, { items });
    } catch (error) {
        console.error("Failed to fetch user items", error);
        return sendError(res, "Failed to fetch user items", HTTP_STATUS.SERVER_ERROR, error);
    }
});

// GET /api/marketplace/:id - Get single item
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const listing = await Listing.findOne({
            where: { id, type: "Item" },
            include: [
                {
                    model: ItemListing,
                    as: "itemDetails",
                    required: true,
                },
                {
                    model: ListingImage,
                    as: "images",
                    attributes: ["id", "url", "isPrimary", "is360"],
                },
                {
                    model: User,
                    as: "owner",
                    attributes: ["id", "firstName", "lastName", "avatarUrl", "email", "phoneNumber"],
                },
            ],
        });

        if (!listing) {
            return sendError(res, "Item not found", HTTP_STATUS.NOT_FOUND);
        }

        // Increment view count
        await listing.increment("viewCount");

        const item = {
            id: listing.id,
            title: listing.title,
            description: listing.description,
            viewCount: listing.viewCount + 1,
            price: listing.itemDetails?.price,
            currency: listing.itemDetails?.currency,
            condition: listing.itemDetails?.condition,
            category: listing.itemDetails?.category,
            contactPhone: listing.itemDetails?.contactPhone,
            contactEmail: listing.itemDetails?.contactEmail,
            images: listing.images || [],
            owner: listing.owner,
            createdAt: listing.createdAt,
            updatedAt: listing.updatedAt,
        };

        return sendSuccess(res, item);
    } catch (error) {
        console.error("Failed to fetch item", error);
        return sendError(res, "Failed to fetch item", HTTP_STATUS.SERVER_ERROR, error);
    }
});

// POST /api/marketplace - Create new item (students only)
router.post("/", authenticate, authorize(["Student", "Admin", "SuperAdmin"]), blockLandlords, async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            title,
            description,
            price,
            currency,
            condition,
            category,
            contactPhone,
            contactEmail,
            images,
        } = req.body;

        if (!title || !description || !price) {
            return sendError(res, "Title, description, and price are required", HTTP_STATUS.BAD_REQUEST);
        }

        // Create base listing
        const listing = await Listing.create({
            type: "Item",
            title: title.trim(),
            description: description.trim(),
            ownerId: userId,
            isActive: true,
            isPublished: true,
        });

        // Create item details
        await ItemListing.create({
            listingId: listing.id,
            price: parseFloat(price),
            currency: currency || "NIS",
            condition: condition || "good",
            category: category || "other",
            contactPhone: contactPhone || null,
            contactEmail: contactEmail || null,
        });

        // Create images if provided
        if (images && Array.isArray(images) && images.length > 0) {
            const imageRecords = images.map((img, index) => ({
                listingId: listing.id,
                url: img.url,
                publicId: img.publicId || null,
                isPrimary: index === 0,
                is360: img.is360 || false,
            }));
            await ListingImage.bulkCreate(imageRecords);
        }

        // Fetch the created item with all associations
        const createdListing = await Listing.findByPk(listing.id, {
            include: [
                { model: ItemListing, as: "itemDetails" },
                { model: ListingImage, as: "images" },
                { model: User, as: "owner", attributes: ["id", "firstName", "lastName", "avatarUrl"] },
            ],
        });

        return sendSuccess(res, createdListing, HTTP_STATUS.CREATED);
    } catch (error) {
        console.error("Failed to create item", error);
        return sendError(res, "Failed to create item", HTTP_STATUS.SERVER_ERROR, error);
    }
});

// PUT /api/marketplace/:id - Update item (owner only)
router.put("/:id", authenticate, blockLandlords, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const listing = await Listing.findOne({
            where: { id, type: "Item" },
            include: [{ model: ItemListing, as: "itemDetails" }],
        });

        if (!listing) {
            return sendError(res, "Item not found", HTTP_STATUS.NOT_FOUND);
        }

        // Only owner or admin can update
        if (listing.ownerId !== userId && !["Admin", "SuperAdmin"].includes(userRole)) {
            return sendError(res, "Not authorized to update this item", HTTP_STATUS.FORBIDDEN);
        }

        const {
            title,
            description,
            price,
            currency,
            condition,
            category,
            contactPhone,
            contactEmail,
            isActive,
        } = req.body;

        // Update base listing
        if (title) listing.title = title.trim();
        if (description) listing.description = description.trim();
        if (typeof isActive === "boolean") listing.isActive = isActive;
        await listing.save();

        // Update item details
        if (listing.itemDetails) {
            if (price) listing.itemDetails.price = parseFloat(price);
            if (currency) listing.itemDetails.currency = currency;
            if (condition) listing.itemDetails.condition = condition;
            if (category) listing.itemDetails.category = category;
            if (contactPhone !== undefined) listing.itemDetails.contactPhone = contactPhone;
            if (contactEmail !== undefined) listing.itemDetails.contactEmail = contactEmail;
            await listing.itemDetails.save();
        }

        // Fetch updated listing
        const updatedListing = await Listing.findByPk(id, {
            include: [
                { model: ItemListing, as: "itemDetails" },
                { model: ListingImage, as: "images" },
                { model: User, as: "owner", attributes: ["id", "firstName", "lastName", "avatarUrl"] },
            ],
        });

        return sendSuccess(res, updatedListing);
    } catch (error) {
        console.error("Failed to update item", error);
        return sendError(res, "Failed to update item", HTTP_STATUS.SERVER_ERROR, error);
    }
});

// DELETE /api/marketplace/:id - Delete item (owner or admin)
router.delete("/:id", authenticate, blockLandlords, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const listing = await Listing.findOne({
            where: { id, type: "Item" },
        });

        if (!listing) {
            return sendError(res, "Item not found", HTTP_STATUS.NOT_FOUND);
        }

        // Only owner or admin can delete
        if (listing.ownerId !== userId && !["Admin", "SuperAdmin"].includes(userRole)) {
            return sendError(res, "Not authorized to delete this item", HTTP_STATUS.FORBIDDEN);
        }

        await listing.destroy();

        return sendSuccess(res, { message: "Item deleted successfully" });
    } catch (error) {
        console.error("Failed to delete item", error);
        return sendError(res, "Failed to delete item", HTTP_STATUS.SERVER_ERROR, error);
    }
});

// PATCH /api/marketplace/:id/toggle-visibility - Toggle item visibility
router.patch("/:id/toggle-visibility", authenticate, blockLandlords, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const listing = await Listing.findOne({
            where: { id, type: "Item" },
        });

        if (!listing) {
            return sendError(res, "Item not found", HTTP_STATUS.NOT_FOUND);
        }

        if (listing.ownerId !== userId) {
            return sendError(res, "Not authorized", HTTP_STATUS.FORBIDDEN);
        }

        listing.isActive = !listing.isActive;
        await listing.save();

        return sendSuccess(res, { isActive: listing.isActive });
    } catch (error) {
        console.error("Failed to toggle visibility", error);
        return sendError(res, "Failed to toggle visibility", HTTP_STATUS.SERVER_ERROR, error);
    }
});

module.exports = router;
