require('dotenv').config();
const { Groq } = require('groq-sdk');
const { TwitterApi } = require("twitter-api-v2");
const NewsAPI = require('newsapi');
const axios = require('axios');

console.log('Starting Twitter Automation Bot...');
console.log('Loading environment variables...');

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_APP_KEY,
  appSecret: process.env.TWITTER_APP_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const newsapi = new NewsAPI(process.env.NEWS_API_KEY);

console.log('API clients initialized successfully');

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
    console.log(`Downloading image from: ${url}`);
    const response = await axios({
      url,
      responseType: 'arraybuffer'
    });
    console.log('Image downloaded successfully');
    return response.data;
  } catch (error) {
    console.error('Error downloading image:', error);
    return null;
  }
}

async function getLatestTechNews() {
  try {
    console.log('Fetching latest tech news...');
    const response = await newsapi.v2.topHeadlines({
      category: 'technology',
      language: 'en',
      pageSize: 5
    });
    console.log(`Found ${response.articles.length} tech news articles`);
    return response.articles;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

async function generateAndTweet(prompt, imageBuffer) {
  console.log('Generating tweet content...');
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
  }

  console.log('Tweet content generated successfully');
  return await sendTweet(fullText.trim(), imageBuffer);
}

async function sendTweet(tweetText, imageBuffer) {
  try {
    console.log('Preparing to send tweet...');
    if (tweetText.length > 280) {
      console.log('Tweet is too long, truncating...');
      tweetText = tweetText.substring(0, 277) + '...';
    }

    if (imageBuffer) {
      console.log('Uploading image...');
      const mediaId = await twitterClient.v1.uploadMedia(imageBuffer, { mimeType: 'image/jpeg' });
      console.log('Image uploaded, sending tweet with image...');
      await twitterClient.v2.tweet({
        text: tweetText,
        media: { media_ids: [mediaId] }
      });
    } else {
      console.log('Sending tweet without image...');
      await twitterClient.v2.tweet(tweetText);
    }
    console.log('Tweet sent successfully!');
    return { success: true, message: "Tweet sent successfully!" };
  } catch (error) {
    console.error("Error sending tweet:", error);
    return { 
      success: false, 
      error: error.message,
      code: error.code 
    };
  }
}

// Main function to run the bot
async function runBot() {
  try {
    console.log('\n=== Starting New Tweet Cycle ===');
    
    // Verify Twitter credentials first
    const me = await twitterClient.v2.me();
    console.log(`Connected to Twitter as: @${me.data.username}`);

    // Get latest tech news
    const newsArticles = await getLatestTechNews();
    const dayCount = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % 100 + 1;
    console.log(`Current day count: ${dayCount}`);
    
    let prompt, imageBuffer;
    
    if (newsArticles.length === 0) {
      console.log('No news articles found, using default prompt');
      prompt = `Day ${dayCount} of 100: Generate a tweet about software development, tips and tricks, or something new in tech. Keep it under 280 characters, use emojis if appropriate, and make it engaging.`;
      const defaultImageUrl = DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)];
      imageBuffer = await downloadImage(defaultImageUrl);
    } else {
      const randomArticle = newsArticles[Math.floor(Math.random() * newsArticles.length)];
      console.log(`Selected article: ${randomArticle.title}`);
      prompt = `Day ${dayCount} of 100: Create a professional technical tweet about programming languages and development, inspired by: "${randomArticle.title}".

        Requirements:
        1. Focus on technical depth and professional insights about programming languages (Python, JavaScript, Java, C++, C#, etc.)
        2. Include specific technical details, best practices, or advanced concepts
        3. Add relevant technical hashtags:
           - Language-specific: #Python #JavaScript #Java #Cpp #CSharp
           - Technical: #SoftwareEngineering #WebDev #BackendDev #FrontendDev
           - Advanced: #SystemDesign #Architecture #CleanCode #DevOps
        4. Use professional emojis (💻 🛠️ ⚡ 🔧)
        5. Keep it under 280 characters
        6. Make it sound like an expert developer sharing knowledge
        7. Include a technical tip or best practice if relevant

        Don't include the source or date.`;

      if (randomArticle.urlToImage) {
        imageBuffer = await downloadImage(randomArticle.urlToImage);
      }
      if (!imageBuffer) {
        const defaultImageUrl = DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)];
        imageBuffer = await downloadImage(defaultImageUrl);
      }
    }

    const result = await generateAndTweet(prompt, imageBuffer);
    console.log('Tweet cycle completed:', result);
    return result;
  } catch (error) {
    console.error('Error in tweet cycle:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Run the bot immediately when started
runBot().then(result => {
  console.log('\nBot execution completed');
  if (!result.success) {
    console.error('Error:', result.error);
  }
}).catch(error => {
  console.error('Fatal error:', error);
});

// Export for Vercel
module.exports = async (req, res) => {
  const result = await runBot();
  res.status(result.success ? 200 : 500).json(result);
};
