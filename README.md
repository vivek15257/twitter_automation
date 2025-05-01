# twitter_automation

Automate posting tweets using AI-generated content with Groq and the Twitter API.

## Features
- Generates unique web development tweets using Groq LLMs
- Posts tweets automatically to your Twitter account
- Streams AI output in real-time to the console

## Prerequisites
- Node.js (v18 or higher recommended)
- A Twitter Developer account ([apply here](https://developer.twitter.com/en/portal/dashboard))
- A Groq account ([get API key here](https://console.groq.com/keys))

## Setup
1. **Clone this repository**
   ```sh
   git clone <your-repo-url>
   cd twitter_automation
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Configure your API keys**
   - Open `SECRETS.js` and replace the placeholder values with your actual credentials:
     ```js
     const APP_KEY = "YOUR_TWITTER_API_KEY";
     const APP_SECRET = "YOUR_TWITTER_API_SECRET";
     const ACCESS_TOKEN = "YOUR_TWITTER_ACCESS_TOKEN";
     const ACCESS_SECRET = "YOUR_TWITTER_ACCESS_TOKEN_SECRET";
     const GROQ_API_KEY = "YOUR_GROQ_API_KEY";
     ```
   - You can find these in your Twitter Developer Portal under **Keys and Tokens**.

4. **Run the project**
   ```sh
   npm start
   ```
   The script will generate a tweet using Groq and post it to your Twitter account.

## Troubleshooting
- **Groq 503 Service Unavailable**: This means the Groq API is temporarily down. Wait a few minutes and try again. Check [Groq's status page](https://status.groq.com/) for updates.
- **Twitter authentication errors**: Double-check your API keys and tokens in `SECRETS.js`.

## Security Note
Do **not** share your `SECRETS.js` file or commit it to public repositories. Keep your API keys safe!

---

Feel free to fork and modify for your own automation needs!