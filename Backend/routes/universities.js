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

router.post("/", authenticate, authorize(["SuperAdmin"]), async (req, res) => {
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

// Update university
router.put("/:id", authenticate, authorize(["SuperAdmin"]), async (req, res) => {
  const { id } = req.params;
  const { name, city, domain, latitude, longitude } = req.body;

  if (!name || !name.trim()) {
    return sendError(
      res,
      "University name is required",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  try {
    const university = await University.findByPk(id);
    if (!university) {
      return sendError(res, "University not found", HTTP_STATUS.NOT_FOUND);
    }

    await university.update({
      name: name.trim(),
      city: city?.trim() || null,
      domain: domain?.trim() || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
    });

    return sendSuccess(res, university, "University updated successfully");
  } catch (error) {
    console.error("Failed to update university", error);
    return sendError(
      res,
      "Failed to update university",
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
});

// Delete university
router.delete("/:id", authenticate, authorize(["SuperAdmin"]), async (req, res) => {
  const { id } = req.params;

  try {
    const university = await University.findByPk(id);
    if (!university) {
      return sendError(res, "University not found", HTTP_STATUS.NOT_FOUND);
    }

    await university.destroy();
    return sendSuccess(res, null, "University deleted successfully");
  } catch (error) {
    console.error("Failed to delete university", error);
    return sendError(
      res,
      "Failed to delete university",
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
});

module.exports = router;
