
const { Groq } = require('groq-sdk');
const { TwitterApi } = require("twitter-api-v2");
const NewsAPI = require('newsapi');
const axios = require('axios');
const SECRETS = require("./SECRETS");

const twitterClient = new TwitterApi({
  appKey: SECRETS.APP_KEY,
  appSecret: SECRETS.APP_SECRET,
  accessToken: SECRETS.ACCESS_TOKEN,
  accessSecret: SECRETS.ACCESS_SECRET,
});

const groq = new Groq({
  apiKey: SECRETS.GROQ_API_KEY,
});

const newsapi = new NewsAPI(SECRETS.NEWS_API_KEY);

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
  }

  return await sendTweet(fullText.trim(), imageBuffer);
}

async function sendTweet(tweetText, imageBuffer) {
  try {
    if (tweetText.length > 280) {
      tweetText = tweetText.substring(0, 277) + '...';
    }

    if (imageBuffer) {
      const mediaId = await twitterClient.v1.uploadMedia(imageBuffer, { mimeType: 'image/jpeg' });
      await twitterClient.v2.tweet({
        text: tweetText,
        media: { media_ids: [mediaId] }
      });
    } else {
      await twitterClient.v2.tweet(tweetText);
    }
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

module.exports = async (req, res) => {
  try {
    // Verify Twitter credentials first
    const me = await twitterClient.v2.me();
    console.log(`Connected to Twitter as: @${me.data.username}`);

    // Get latest tech news
    const newsArticles = await getLatestTechNews();
    const dayCount = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % 100 + 1;
    
    let prompt, imageBuffer;
    
    if (newsArticles.length === 0) {
      prompt = `Day ${dayCount} of 100: Generate a tweet about software development, tips and tricks, or something new in tech. Keep it under 280 characters, use emojis if appropriate, and make it engaging.`;
      const defaultImageUrl = DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)];
      imageBuffer = await downloadImage(defaultImageUrl);
    } else {
      const randomArticle = newsArticles[Math.floor(Math.random() * newsArticles.length)];
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
    res.status(200).json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
