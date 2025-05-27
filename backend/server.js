import 'dotenv/config'; // Loads .env from CWD (project root)
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import OpenAI from 'openai'; // Using default import as per user example for ESM

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: {
    'OpenAI-Beta': 'assistants=v2',
  },
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Static assistant ID from run-once setup
const assistantId = 'asst_cXbCltJzh9d5zJhq65hBjLPa'; // This ID should be re-verified after running the ESM version of run-once-setup.js

// 🎯 Route to create a new thread
app.post('/init', async (req, res) => {
  try {
    const thread = await openai.beta.threads.create();
    res.json({ threadId: thread.id });
  } catch (err) {
    // Enhanced error logging
    console.error("Error in /init route:", err);
    res.status(500).json({ error: err.message, details: err.stack });
  }
});

// 💬 Route to send a message (streaming)
app.post('/chat', async (req, res) => {
  const { threadId, messages } = req.body;

  if (!threadId || !messages || !Array.isArray(messages) || messages.length === 0) {
    console.error("Error in /chat: threadId or messages are missing/invalid");
    return res.status(400).json({ error: "threadId and a non-empty messages array are required" });
  }
  if (!assistantId) {
    console.error("Error in /chat: assistantId is not configured on the server");
    return res.status(500).json({ error: "Assistant ID not configured on server." });
  }

  const latestUserMessage = messages[messages.length - 1];
  if (!latestUserMessage || latestUserMessage.role !== 'user' || typeof latestUserMessage.content !== 'string') {
      console.error("Error in /chat: Last message in 'messages' array is not a valid user message with text content.");
      return res.status(400).json({ error: "Last message must be from user with string content." });
  }

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Send headers immediately

  try {
    // Step 1: Add the latest user message to the thread
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: latestUserMessage.content,
    });

    // Step 2: Create a run and stream the response
    const stream = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
      stream: true,
    });

    for await (const event of stream) {
      if (event.event === 'thread.message.delta') {
        const chunk = event.data.delta.content?.[0]?.text?.value;
        if (chunk) {
          res.write(chunk); // Send raw chunk without SSE formatting
        }
      } else if (event.event === 'thread.run.requires_action') {
        // Placeholder for handling tool calls if they become necessary
        console.log('Run requires action:', event.data);
        // If you need to submit tool outputs, you would do it here using:
        // await openai.beta.threads.runs.submitToolOutputs(threadId, run.id, { tool_outputs: [...], stream: true });
        // And then continue processing the stream for more deltas or completion.
        // For now, this example assumes no tool calls that require client-side submission.
      } else if (event.event === 'thread.run.failed') {
        console.error('Run failed:', event.data.last_error);
        res.write(`[ERROR] Run failed: ${event.data.last_error?.message || 'Unknown error'}`);
        break; 
      }
      // Other events like 'thread.run.queued', 'thread.run.in_progress', 'thread.run.completed'
      // can be logged or handled if needed. 'thread.message.completed' indicates the full message is formed.
    }
  } catch (err) {
    console.error('Streaming error in /chat route:', err);
    if (!res.headersSent) {
      res.status(500).send('Server error during streaming setup');
    } else {
      // If headers are sent, we can only try to send an error event if the stream is still open
      if (res.writable && !res.writableEnded) {
        res.write(`data: [ERROR] Server error occurred: ${err.message}\n\n`);
      }
    }
  } finally {
    if (res.writable && !res.writableEnded) {
      res.end();
    }
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server listening on ${PORT}`));
