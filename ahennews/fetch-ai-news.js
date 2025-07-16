
const fs = require('fs');
const axios = require('axios');

// --- Real News Fetcher ---
// Fetches news from NewsAPI.org
async function fetchNewsForSector(sector) {
  const apiKey = process.env.NEWS_API_KEY; // Replace with your key or use environment variables
  if (apiKey === 'YOUR_API_KEY') {
    console.error('ERROR: NewsAPI key not set. Please replace "YOUR_API_KEY" with your actual key.');
    return [];
  }

  const url = `https://newsapi.org/v2/everything?q=${sector}&apiKey=${apiKey}`;

  try {
    console.log(`Fetching news for ${sector}...`);
    const response = await axios.get(url);
    // Format the articles to match the structure your template expects
    return response.data.articles.slice(0, 5).map(article => ({
      title: article.title,
      summary: article.description,
      link: article.url
    }));
  } catch (error) {
    console.error(`Error fetching news for ${sector}:`, error.message);
    return []; // Return an empty array on error
  }
}

async function main() {
  const sectors = ['technology', 'business', 'politics', 'science', 'entertainment'];
  const newsData = {};

  for (const sector of sectors) {
    newsData[sector] = await fetchNewsForSector(sector);
  }

  const outputPath = './_data/ai_news.json';
  fs.writeFileSync(outputPath, JSON.stringify(newsData, null, 2));
  console.log(`Successfully wrote updated news to ${outputPath}`);
}

main();
