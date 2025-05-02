# twitter_automation

Automate posting tweets using AI-generated content with Groq and the Twitter API. This project is designed to run on Vercel with daily automated tweets.

## Features
- Generates unique tech tweets using Groq LLMs
- Posts tweets automatically to your Twitter account
- Includes relevant images with tweets
- Runs daily at 9:00 AM UTC
- Deployed on Vercel (no need to keep your computer running)

## Prerequisites
- A Twitter Developer account ([apply here](https://developer.twitter.com/en/portal/dashboard))
- A Groq account ([get API key here](https://console.groq.com/keys))
- A News API key ([get here](https://newsapi.org/))
- A Vercel account ([sign up here](https://vercel.com))

## Setup

### 1. Fork this repository
Click the "Fork" button at the top of this repository to create your own copy.

### 2. Set up environment variables in Vercel
1. Go to your Vercel dashboard
2. Create a new project and import your forked repository
3. Add the following environment variables:
   ```
   TWITTER_APP_KEY=your_twitter_app_key
   TWITTER_APP_SECRET=your_twitter_app_secret
   TWITTER_ACCESS_TOKEN=your_twitter_access_token
   TWITTER_ACCESS_SECRET=your_twitter_access_secret
   GROQ_API_KEY=your_groq_api_key
   NEWS_API_KEY=your_news_api_key
   ```

### 3. Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Vercel will automatically deploy your project
3. The cron job will run daily at 9:00 AM UTC

## How it Works
1. The Vercel cron job triggers the API endpoint daily
2. The script fetches the latest tech news
3. Uses Groq to generate an engaging tweet
4. Posts the tweet with a relevant image
5. Logs the result in Vercel's function logs

## Monitoring
- Check Vercel's deployment logs to monitor tweet posting
- View your Twitter account to see the posted tweets
- The function returns a success/error response that you can monitor

## Troubleshooting
- **Twitter API Errors**: Check your Twitter API credentials and permissions
- **Groq API Errors**: Verify your Groq API key
- **News API Errors**: Check your News API key and quota
- **Vercel Deployment Issues**: Check the Vercel deployment logs

## Security Note
- Never commit your `.env` file or expose your API keys
- Use Vercel's environment variables for secure key storage
- Regularly rotate your API keys for better security

---

Feel free to fork and modify for your own automation needs!