// By VishwaGauravIn (https://itsvg.in)

const { Groq } = require('groq-sdk');
const { TwitterApi } = require("twitter-api-v2");
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

async function run() {
  const prompt =
    "generate a web development content, tips and tricks or something new or some rant or some advice as a tweet, it should not be vague and should be unique; under 280 characters and should be plain text, you can use emojis";

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
  sendTweet(fullText.trim());
}

run();

async function sendTweet(tweetText) {
  try {
    await twitterClient.v2.tweet(tweetText);
    console.log("Tweet sent successfully!");
  } catch (error) {
    console.error("Error sending tweet:", error);
  }
}
