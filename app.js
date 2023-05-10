const express = require("express");
const axios = require("axios");
const ejs = require("ejs");
require("dotenv").config();

// Helper function to fetch stonk data
async function fetchStockData() {
  try {
    const symbols = ["AAPL", "GOOGL", "MSFT"]; // Define an array of stock symbols you want to fetch data for
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    const requests = symbols.map((symbol) =>
      axios.get(
        `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=1&apikey=${apiKey}`
      )
    );

    const responses = await Promise.all(requests);
    const stocks = responses.map((response) => {
      const data = response.data.values[0];
      return {
        ...data,
        symbol: response.data.meta.symbol,
        name: response.data.meta.name,
        logo: "https://via.placeholder.com/50", // Placeholder image URL
        current_price: data.close,
        market_cap: data.market_cap,
        volume: data.volume,
        percent_change: ((data.close - data.open) / data.open) * 100,
      };
    });

    return stocks;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Helper function for fetching individual stonx
async function fetchIndividualStockData(symbol) {
  try {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    const priceResponse = await axios.get(
      `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${apiKey}`
    );
    const historicalResponse = await axios.get(
      `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=30&apikey=${apiKey}`
    );

    return {
      ...priceResponse.data,
      historical: historicalResponse.data.values,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  // Fetch stonks
  const stocks = await fetchStockData();
  console.log(stocks);

  // + render home
  res.render("index", { stocks });
});

app.get("/stock/:symbol", async (req, res) => {
  const symbol = req.params.symbol;

  // Fetch individual stonx data
  const stock = await fetchIndividualStockData(symbol);

  // Render the stonx page
  res.render("stock", { stock });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
