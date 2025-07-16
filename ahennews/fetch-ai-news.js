
const fs = require('fs');
const axios = require('axios');

// --- Real News Fetcher ---
// Fetches Indian business news from NewsAPI.org
async function fetchNewsForTopic(topic, query) {
  const apiKey = process.env.NEWS_API_KEY;
  console.log(`DEBUG: NEWS_API_KEY value: ${apiKey ? 'SET' : 'NOT SET'}`);
  if (!apiKey) {
    console.error('ERROR: NewsAPI key not set in environment variables.');
    return [];
  }

  // Using the /v2/top-headlines endpoint is better for country-specific news.
  // We set country to 'in' and category to 'business'.
  // The 'q' parameter will further refine the search within Indian business news.
  const indianDomains = 'timesofindia.indiatimes.com,thehindu.com,hindustantimes.com,indianexpress.com,ndtv.com,livemint.com,businesstoday.in';
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&domains=${indianDomains}&language=en&sortBy=relevancy&apiKey=${apiKey}`;

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
      link: article.url
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
