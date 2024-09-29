//Require all Instances
const axios = require("axios");
const express = require("express");
const app = express();
const cors = require("cors");

//MiddleWare for parse and connect frontend to node.js
app.use(cors());
app.use(express.json());

//Api keys from Google console 
const YOUTUBE_API_KEY = "AIzaSyDhg3wefk5ebFEdTahdPvEOYSRjMiDyRG0";
const GOOGLE_API_KEY = "AIzaSyCW50PZxIPhprITcccCpuMRV1ES7QoTIRc";
const SEARCH_ENGINE_ID = "20b9d3d19ef7a4954";
const SERP_API_KEY = "9c2641c3fbb242269ecd30b59d0c14105a1795ef9f5846009606f2afa5bff10b";

//Function for calculate the views for youtube vdeos only
async function getVideoStatistics(videoIds) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`;
  const response = await axios.get(url);
  return response.data.items.reduce((stats, video) => {
    stats[video.id] = video.statistics.viewCount;
    return stats;
  }, {});
}


//Fetch data from Youtube api
async function searchYouTube(query) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${YOUTUBE_API_KEY}&type=video`;
  const response = await axios.get(url);
  
  const videoIds = response.data.items.map((video) => video.id.videoId); //fetched data from the youtube api by using axios response.data object 
  const videoStatistics = await getVideoStatistics(videoIds); 

  return response.data.items.map((video) => ({
    source: "YouTube",
    title: video.snippet.title,
    description: video.snippet.description,
    link: `https://www.youtube.com/watch?v=${video.id.videoId}`, 
    views: videoStatistics[video.id.videoId] || 0,
    thumbnail: video.snippet.thumbnails.default.url,
  }));
}

//Api for search the artice by using custom api
async function searchArticles(query) {
  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${query}`;
  const response = await axios.get(url);
  return response.data.items.map((article) => ({
    source: "Article",
    title: article.title,
    description: article.snippet,
    link: article.link,
    views: Math.floor(Math.random() * 10000), //Random views by using math random
  }));
}

//APi for scholar 
async function searchGoogleScholar(query) {
  const url = `https://serpapi.com/search.json?q=${query}&engine=google_scholar&api_key=${SERP_API_KEY}`;
  const response = await axios.get(url);
  
  
    return response.data.organic_results.map((result) => ({
      source: "Google Scholar",
      title: result.title,
      description: result.snippet,
      link: result.link,
      views: Math.floor(Math.random() * 1000),
    }));
  
  
}

//Funtion to compare the views and sort used for givng higher views everytime
function rankResultsByViews(results) {
  return results.sort((a, b) => b.views - a.views);
}

//Get Request 


app.get("/search", async (req, res) => {
  const query = req.query.q;

  try {
    const [youtubeResults, articleResults, scholarResults] = await Promise.all([  // it will return a promise for all the functions
      searchYouTube(query),
      searchArticles(query),
      searchGoogleScholar(query),
    ]);

    let combinedResults = [...youtubeResults, ...articleResults, ...scholarResults]; // combine them to see wheather which one has higher views

    combinedResults = rankResultsByViews(combinedResults);

    res.json(combinedResults);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching search results");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
