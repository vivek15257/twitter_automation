// By VishwaGauravIn (https://itsvg.in)

const { Groq } = require('groq-sdk');
const { TwitterApi } = require("twitter-api-v2");
const NewsAPI = require('newsapi');
const cron = require('node-cron');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const SECRETS = require("./SECRETS");

const twitterClient = new TwitterApi({
  appKey: SECRETS.APP_KEY,
  appSecret: SECRETS.APP_SECRET,
  accessToken: SECRETS.ACCESS_TOKEN,
  accessSecret: SECRETS.ACCESS_SECRET,
});

// Verify Twitter credentials
async function verifyTwitterCredentials() {
  try {
    const me = await twitterClient.v2.me();
    console.log(`Connected to Twitter as: @${me.data.username}`);
    return true;
  } catch (error) {
    console.error('Twitter API Error:', error.message);
    if (error.code === 403) {
      console.error('Please check your Twitter API credentials and ensure they have write permissions.');
      console.error('You can check your app permissions at: https://developer.twitter.com/en/portal/dashboard');
    }
    return false;
  }
}

const groq = new Groq({
  apiKey: SECRETS.GROQ_API_KEY,
});

const newsapi = new NewsAPI(SECRETS.NEWS_API_KEY);

// Track the number of days
let dayCount = 0;
const TOTAL_DAYS = 100;

// Default tech images to use if article has no image
const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=630&fit=crop',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=630&fit=crop',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=630&fit=crop',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=630&fit=crop',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&h=630&fit=crop'
];

async function downloadImage(url) {
  try {
    const response = await axios({
      url,
      responseType: 'arraybuffer'
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading image:', error);
    return null;
  }
}

async function getLatestTechNews() {
  try {
    const response = await newsapi.v2.topHeadlines({
      category: 'technology',
      language: 'en',
      pageSize: 5
    });
    
    return response.articles;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

async function run() {
  // Verify Twitter credentials first
  const isTwitterValid = await verifyTwitterCredentials();
  if (!isTwitterValid) {
    console.error('Exiting due to Twitter API issues. Please fix your credentials.');
    process.exit(1);
  }

  dayCount++;
  console.log(`\n=== Day ${dayCount} of ${TOTAL_DAYS} ===`);
  
  // Get latest tech news
  const newsArticles = await getLatestTechNews();
  
  if (newsArticles.length === 0) {
    console.log('No news articles found. Using default prompt.');
    const defaultPrompt = `Day ${dayCount} of 100: Generate a tweet about software development, tips and tricks, or something new in tech. Keep it under 280 characters, use emojis if appropriate, and make it engaging.`;
    // Use a random default image
    const defaultImageUrl = DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)];
    const imageBuffer = await downloadImage(defaultImageUrl);
    await generateAndTweet(defaultPrompt, imageBuffer);
    return;
  }

  // Select a random article
  const randomArticle = newsArticles[Math.floor(Math.random() * newsArticles.length)];
  
  // Create a prompt based on the news article
  const prompt = `Day ${dayCount} of 100: Create an engaging tweet about this coding language: "${randomArticle.title}". 
    Include:
    1. A brief, interesting summary or key takeaway
    2. A thought-provoking question or call-to-action
    3. 8-10 relevant hashtags (like #TechNews #Coding #Programming #AI #WebDev)
    4. Appropriate emojis
    5. Keep it under 280 characters
    Don't include the source or date.`;

  // Get image from article or use default
  let imageBuffer = null;
  if (randomArticle.urlToImage) {
    imageBuffer = await downloadImage(randomArticle.urlToImage);
  }
  if (!imageBuffer) {
    const defaultImageUrl = DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)];
    imageBuffer = await downloadImage(defaultImageUrl);
  }

  await generateAndTweet(prompt, imageBuffer);
}

async function generateAndTweet(prompt, imageBuffer) {
  let fullText = '';
  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_completion_tokens: 400,
    stream: true
  });

  for await (const chunk of chatCompletion) {
    const content = chunk.choices[0]?.delta?.content || '';
    fullText += content;
    process.stdout.write(content);
  }

  console.log('\n');
  await sendTweet(fullText.trim(), imageBuffer);
}

async function sendTweet(tweetText, imageBuffer) {
  try {
    // Ensure tweet is within Twitter's character limit
    if (tweetText.length > 280) {
      console.log('Tweet is too long, truncating to 280 characters...');
      tweetText = tweetText.substring(0, 277) + '...';
    }

    if (imageBuffer) {
      // Upload the image first
      const mediaId = await twitterClient.v1.uploadMedia(imageBuffer, { mimeType: 'image/jpeg' });
      // Then tweet with the image
      await twitterClient.v2.tweet({
        text: tweetText,
        media: { media_ids: [mediaId] }
      });
    } else {
      // Tweet without image if image upload failed
      await twitterClient.v2.tweet(tweetText);
    }
    console.log("Tweet sent successfully!");
  } catch (error) {
    console.error("Error sending tweet:", error);
    if (error.code === 403) {
      console.error('Please check your Twitter API credentials and ensure they have write permissions.');
    }
  }
}

// Schedule the script to run once per day at 9:00 AM
console.log('Starting 100 Days of Tech Tweets...');
console.log('Tweets will be posted daily at 9:00 AM');

// Run immediately on startup
run();

// Schedule daily runs
cron.schedule('0 9 * * *', () => {
  if (dayCount < TOTAL_DAYS) {
    run();
  } else {
    console.log('\n=== 100 Days Challenge Completed! ===');
    process.exit(0);
  }
});
