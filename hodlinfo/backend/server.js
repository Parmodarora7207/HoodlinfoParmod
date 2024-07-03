const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();

const Ticker = require("./models/Ticker.js");
const tickerRoutes = require("./routes/ticker.js");

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

// Fetch data from WazirX API and store in MongoDB
// app.get("/fetch-and-store", async (req, res) => {
//   try {
//     const response = await axios.get("https://api.wazirx.com/api/v2/tickers");
//     const data = response.data;
//     const tickers = Object.values(data).slice(0, 10); // Get top 10 results

//     const tickerDocuments = tickers.map((ticker) => ({
//       name: ticker.name,
//       last: ticker.last,
//       buy: ticker.buy,
//       sell: ticker.sell,
//       volume: ticker.volume,
//       base_unit: ticker.base_unit,
//     }));

//     // Clear existing data
//     await Ticker.deleteMany({});

//     // Insert new data
//     await Ticker.insertMany(tickerDocuments);

//     res.status(200).json({ message: "Data fetched and stored successfully" });
//   } catch (error) {
//     console.error("Error fetching or storing data", error);
//     res.status(500).json({ message: "Error fetching or storing data" });
//   }
// });
// Fetch and store route
app.get("/fetch-and-store", async (req, res) => {
  try {
    const response = await axios.get("https://api.wazirx.com/api/v2/tickers");
    const data = response.data;
    const tickers = Object.values(data)
      .sort((a, b) => b.last - a.last)
      .slice(0, 10); // Sort by price and get top 10

    await Ticker.deleteMany({}); // Clear existing data

    const tickerDocuments = tickers.map((ticker) => ({
      name: ticker.name,
      last: ticker.last,
      buy: ticker.buy,
      sell: ticker.sell,
      volume: ticker.volume,
      base_unit: ticker.base_unit,
    }));

    const createdTickers = await Ticker.create(tickerDocuments);

    res.status(200).json({ data: createdTickers });
  } catch (error) {
    console.error("Error fetching or storing data", error);
    res.status(500).json({ message: "Error fetching or storing data" });
  }
});

// API to get top 10 tickers
app.get("/top-items", async (req, res) => {
  try {
    const items = await Ticker.find().sort({ price: -1 }).limit(10);
    res.json(items);
  } catch (error) {
    res.status(500).send(error);
  }
});
// Use the ticker routes
app.use("/api", tickerRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
