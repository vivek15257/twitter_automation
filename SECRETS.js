//? It is advisable to use environment variables instead of directly putting secrets in repository file but I have skipped this part as it would become complicated for many.
//? Alternatively you can download the repository instead or forking and upload it from your account and keep it private, in that way, your secrets will not be exposed to the public.

// TODO: Replace these placeholder values with your actual API keys
// Get Twitter API keys from: https://developer.twitter.com/en/portal/dashboard
// Get Groq API key from: https://console.groq.com/keys
const APP_KEY = "fpE29u6Upl1ASyDYbRRvEzvJD";
const APP_SECRET = "RNmUrUzXTgi0aQYBpA3VHZH7eUus85Q1sYTnGs6Lz1PdOdxEbg";
const ACCESS_TOKEN = "1917971995448471552-INVf9CRhSLNVvCh2oM5rA4KN5C0kC3";
const ACCESS_SECRET = "L1NevldS0zk1R7h89i1Osr4hw64rUXuFhg6ISmSQ4vERq";
const GROQ_API_KEY = "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";

const SECRETS = {
  APP_KEY,
  APP_SECRET,
  ACCESS_TOKEN,
  ACCESS_SECRET,
  GROQ_API_KEY,
};

module.exports = SECRETS;
