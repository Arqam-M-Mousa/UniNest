const express = require("express");
const { University } = require("../models");
const { sendSuccess, sendError, HTTP_STATUS } = require("../utils/responses");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const universities = await University.findAll({
      attributes: ["id", "name", "city", "domain"],
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

module.exports = router;
