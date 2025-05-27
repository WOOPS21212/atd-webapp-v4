import 'dotenv/config'; // Loads .env from CWD (project root)
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai'; // Using default import for ESM
import { fileURLToPath } from 'url'; // For __dirname equivalent

// ESM equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: {
    'OpenAI-Beta': 'assistants=v2',
  },
});

async function setup() {
  console.log("Starting one-time setup (using explicit vector store with ESM)...");

  // 1. Upload the PDF file
  const filePath = path.join(__dirname, 'docs/ATD-RFP-Response.pdf'); // __dirname is now correctly defined for ESM
  console.log("Uploading PDF:", filePath);
  const file = await openai.files.create({
    file: fs.createReadStream(filePath),
    purpose: 'assistants',
  });
  console.log("✅ File uploaded. File ID:", file.id);

  // 2. Create a vector store
  console.log("Creating vector store...");
  const vectorStore = await openai.beta.vectorStores.create({
    name: 'ATD RFP Vector Store',
  });
  console.log("✅ Vector store created. Vector Store ID:", vectorStore.id);

  // 3. Add the file to the vector store and poll until processed
  console.log(`Adding file ${file.id} to vector store ${vectorStore.id} and polling for completion...`);
  // Using openai.beta.vectorStores.files.createAndPoll to add an existing file and wait for processing
  // This is a correction/interpretation of the user's provided line for uploadAndPoll with a file ID.
  const vectorStoreFile = await openai.beta.vectorStores.files.createAndPoll(vectorStore.id, {
    file_id: file.id,
  });
  console.log("✅ File added to vector store and processed. Status:", vectorStoreFile.status);


  // 4. Create the assistant with the vector store
  console.log("Creating assistant linked to vector store:", vectorStore.id);
  const assistant = await openai.beta.assistants.create({
    name: 'ATD RFP Assistant',
    instructions: 'Answer questions based on the ATD RFP document.',
    model: 'gpt-4',
    tools: [{ type: 'file_search' }],
    tool_resources: {
      file_search: {
        vector_store_ids: [vectorStore.id],
      },
    },
  });

  console.log("✅ Assistant created. Assistant ID:", assistant.id);
  console.log("\nIMPORTANT: Copy the Assistant ID above and provide it back to the agent.");
  console.log("This script should only be run once. If you run it again, it will create a new file and a new assistant.");

}

setup().catch((err) => {
  console.error("❌ Error during one-time setup:", err);
});
