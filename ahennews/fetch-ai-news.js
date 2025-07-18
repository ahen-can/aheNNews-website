
const fs = require('fs');
const axios = require('axios');

// Helper function to get end date (today's date) in YYYY-MM-DD format
function getEndDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper function to get start date (two days ago) in YYYY-MM-DD format
function getStartDate() {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 2); // Two days ago
  const year = startDate.getFullYear();
  const month = String(startDate.getMonth() + 1).padStart(2, '0');
  const day = String(startDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// --- Real News Fetcher ---
// Fetches Indian business news from NewsAPI.org
async function fetchNewsForTopic(topic, query) {
  const apiKey = process.env.NEWS_API_KEY;
  console.log(`DEBUG: NEWS_API_KEY value: ${apiKey ? 'SET' : 'NOT SET'}`);
  if (!apiKey) {
    console.error('ERROR: NewsAPI key not set in environment variables.');
    return [];
  }

  const startDate = getStartDate();
  const endDate = getEndDate();
  const indianDomains = 'timesofindia.indiatimes.com,thehindu.com,hindustantimes.com,indianexpress.com,ndtv.com,livemint.com,businesstoday.in,business-standard.com,economictimes.indiatimes.com,thehindubusinessline.com';
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&domains=${indianDomains}&language=en&from=${startDate}&to=${endDate}&apiKey=${apiKey}`;

  try {
    console.log(`Fetching news for ${topic}...`);
    console.log(`API URL: ${url}`); // Log the URL being called
    const response = await axios.get(url);
    console.log(`API Response Status: ${response.status}`); // Log the HTTP status
    console.log(`Articles received: ${response.data.articles.length}`); // Log number of articles

    if (response.data.articles.length === 0) {
      console.log(`No articles found for ${topic}. Try broadening your search query.`);
    }

    // Format the articles to match the structure your template expects
    return response.data.articles.slice(0, 5).map(article => ({
      title: article.title,
      summary: article.description || 'No summary available.', // Handle cases where description is null
      link: article.url,
      source: article.source.name // Add the source name
    }));
  } catch (error) {
    console.error(`Error fetching news for ${topic}:`, error.message);
    if (error.response) {
      console.error(`API Error Data:`, error.response.data); // Log API error details
    }
    return []; // Return an empty array on error
  }
}

async function main() {
  // These topics will be the titles on your page.
  // The queries are the search terms sent to the API.
  const topics = {
    'Indian Economy': 'economy OR gdp',
    'Stock Market': 'sensex OR nifty',
    'Startups & Funding': 'startup funding OR venture capital',
    'Banking & Finance': 'rbi OR banking OR nbfc',
    'Technology Sector': 'indian it OR infosys OR tcs'
  };
  const newsData = {};

  for (const [topic, query] of Object.entries(topics)) {
    newsData[topic] = await fetchNewsForTopic(topic, query);
  }

  const outputPath = 'ahennews/_data/ai_news.json';
  fs.writeFileSync(outputPath, JSON.stringify(newsData, null, 2));
  console.log(`Successfully wrote updated news to ${outputPath}`);
}

main();
