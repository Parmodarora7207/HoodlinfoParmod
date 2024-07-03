const express = require("express");
const Ticker = require("../models/Ticker");

const router = express.Router();

// Route to get all stored ticker data
router.get("/tickers", async (req, res) => {
  try {
    const tickers = await Ticker.find({});
    res.status(200).json(tickers);
  } catch (error) {
    console.error("Error fetching ticker data", error);
    res.status(500).json({ message: "Error fetching ticker data" });
  }
});

module.exports = router;
