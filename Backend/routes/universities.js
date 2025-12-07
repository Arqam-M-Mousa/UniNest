const express = require("express");
const { University } = require("../models");
const { sendSuccess, sendError, HTTP_STATUS } = require("../utils/responses");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const universities = await University.findAll({
      attributes: ["id", "name", "city", "domain", "latitude", "longitude"],
      order: [["name", "ASC"]],
    });
    return sendSuccess(res, universities, "Universities fetched");
  } catch (error) {
    console.error("Failed to list universities", error);
    return sendError(
      res,
      "Failed to list universities",
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
});

router.post("/", authenticate, authorize(["Admin"]), async (req, res) => {
  const { name, city, domain, latitude, longitude } = req.body;

  if (!name || !name.trim()) {
    return sendError(
      res,
      "University name is required",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  try {
    const university = await University.create({
      name: name.trim(),
      city: city?.trim() || null,
      domain: domain?.trim() || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
    });

    return sendSuccess(
      res,
      university,
      "University created successfully",
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    console.error("Failed to create university", error);
    return sendError(
      res,
      "Failed to create university",
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
});

module.exports = router;
