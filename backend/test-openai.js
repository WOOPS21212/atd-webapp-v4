const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

console.log('vectorStores object:', Object.keys(openai.beta.vectorStores || {}));
