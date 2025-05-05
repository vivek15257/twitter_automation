//? It is advisable to use environment variables instead of directly putting secrets in repository file but I have skipped this part as it would become complicated for many.
//? Alternatively you can download the repository instead or forking and upload it from your account and keep it private, in that way, your secrets will not be exposed to the public.

// TODO: Replace these placeholder values with your actual API keys
// Get Twitter API keys from: https://developer.twitter.com/en/portal/dashboard
// Get Groq API key from: https://console.groq.com/keys

module.exports = {
  APP_KEY: process.env.APP_KEY,
  APP_SECRET: process.env.APP_SECRET,
  ACCESS_TOKEN: process.env.ACCESS_TOKEN,
  ACCESS_SECRET: process.env.ACCESS_SECRET,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  NEWS_API_KEY: process.env.NEWS_API_KEY
};
