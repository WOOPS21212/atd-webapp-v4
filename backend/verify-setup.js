// verify-setup.js
import 'dotenv/config';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: {
    'OpenAI-Beta': 'assistants=v2',
  },
});

const ASSISTANT_ID = 'asst_cXbCltJzh9d5zJhq65hBjLPa';

async function verifyAssistantSetup() {
  try {
    console.log('🔍 Verifying assistant:', ASSISTANT_ID);

    // Fetch assistant details
    const assistant = await openai.beta.assistants.retrieve(ASSISTANT_ID);
    console.log('✅ Assistant loaded:', assistant.name);

    // Check for file search tool
    const fileSearchEnabled = assistant.tools.some(t => t.type === 'file_search');
    if (!fileSearchEnabled) {
      console.warn('⚠️ File Search is NOT enabled on this assistant.');
    } else {
      console.log('📂 File Search is enabled.');
    }

    // List associated vector stores
    if (assistant.tool_resources?.file_search?.vector_store_ids?.length) {
      console.log('📦 Linked vector store(s):');
      assistant.tool_resources.file_search.vector_store_ids.forEach(id => console.log('   -', id));
    } else {
      console.warn('⚠️ No vector store linked to assistant.');
    }

  } catch (err) {
    console.error('❌ Failed to verify assistant:', err.message);
  }
}

verifyAssistantSetup();
