📘 Project Overview: ATD RFP GPT Assistant Web App
This is a custom React + Node.js web application that allows users to:

Chat with a GPT assistant powered by OpenAI’s Assistants API

Ask questions about a specific PDF (an RFP response)

View the PDF side-by-side with the chat interface

Experience streaming responses from GPT

Later, potentially autoscroll the PDF to the referenced page

🧰 Technologies Used
Layer	Tools/Tech
Frontend	React (Vite), ReactMarkdown, Tailwind/Dark CSS
Backend	Node.js, Express
PDF Viewer	<iframe> with embedded PDF
AI API	OpenAI Assistants API (v2, with file search)
Hosting	Vercel (Frontend), Render (Backend)
Versioning	GitHub

✅ Final Working App Architecture
🌐 Frontend (on Vercel)
Built with React

Makes POST requests to the backend (/init)

Streams the assistant response to the UI in real-time

Renders Markdown responses (headings, bold, italic, code, lists)

Left: GPT chat UI | Right: Scrollable embedded PDF

⚙️ Backend (on Render)
Receives POST /init with message payload

Calls OpenAI’s Assistants API with vector store + file

Streams the response in Server-Sent Events (SSE) format

Responds to frontend in chunks (like ChatGPT typing)

🧱 Development Steps (With Key Fixes and Issues)
1. 🛠️ Initial Setup
Created frontend and backend folders

Initialized with create-react-app and Express

Loaded PDF into vector store manually on OpenAI dashboard

Assistant created and linked to vector store via assistant ID

2. ⚠️ What Didn't Work Initially
run-once-setup.js tried to recreate assistant + upload PDF each time
→ ❗ Was redundant after assistant was already created

API call was using v1 of OpenAI Assistants API
→ ❌ "Invalid_beta" error: required OpenAI-Beta: assistants=v2 header

Some .bat scripts used outdated commands (Node v14-style)
→ ❌ Did not match modern module loader (ESM)

✅ Fixes That Worked
Updated API to use Assistants v2

Used .env file to load OPENAI_API_KEY on backend

Switched backend to type: module in package.json

Rewrote run-once-setup.js to only create assistant if it didn't exist

Wrote verify-setup.js to check assistant and vector store linkage

3. 🧪 PDF + Chat UI Integration
🟣 Frontend Enhancements
Used ReactMarkdown with:

remark-gfm

rehype-raw

rehype-sanitize

Rendered Markdown with custom styles:

Code blocks

Lists

Headings

Paragraph spacing

⚠️ Initial Markdown Rendering Failed
Used className on ReactMarkdown components
→ ❌ ReactMarkdown v8+ does not support className

Formatting appeared as a single long string with no breaks

✅ Fix That Worked
Replaced className with style inline for all Markdown elements

Added whiteSpace: 'pre-line' to paragraph renderer

Cleaned up conflicting styles from index.css

4. ⚡ Streaming Responses
Backend sends SSE stream from OpenAI’s run endpoint

Client receives chunks and updates message content on each frame

⚠️ Initial Streaming Broke on Frontend
Did not strip data: prefix from SSE chunks
→ ❌ Caused JSON parse failures

✅ Fix That Worked
Used regex to strip data: and parse JSON manually

Ensured .choices[0].delta.content was added to assistant response state

5. 🌐 Deployment
🔹 Frontend → Vercel
Connected GitHub repo

Configured vite.config.js to work with Vercel build

🔹 Backend → Render
Selected Web Service with Node runtime

Set root directory to backend

Build command: yarn

Start command: node server.js

Set OPENAI_API_KEY in environment variables

⚠️ Frontend Originally Called http://localhost:5000/init
→ ❌ Did not work in production

✅ Fix That Worked
Updated App.js fetch call to use:
https://<your-render-url>.onrender.com/init

🧪 Final Testing
Asked GPT to reference PDF page 3

PDF visible and scrollable in <iframe>

Markdown rendered properly with:

✅ Bold

✅ Italics

✅ Inline code

✅ Code blocks

✅ Numbered + bullet lists

GPT responses streamed word-by-word

🧠 Summary of Challenges Solved
Challenge	Resolution
Assistants API v1 deprecated	Migrated to v2 and updated headers
SSE not parsing on frontend	Stripped data: prefix and used custom chunk handler
Markdown not rendering properly	Used inline styles instead of className with ReactMarkdown
Backend POST endpoint missing on production	Set correct Render URL in frontend fetch calls
Deploying full stack across Vercel + Render	Deployed frontend to Vercel, backend to Render using correct configs
Assistant typing effect not visible	Implemented streaming with real-time assistant reply updates

🏁 Final Result
The final product is a clean, fast, responsive web app that:

Lets users chat with a custom GPT assistant

Allows real-time exploration of a PDF document

Displays answers with full Markdown formatting

Supports streaming replies that simulate GPT typing

Works perfectly in production via Vercel + Render

Let me know when you're ready to:

Add PDF autoscroll based on page mentions

Add authentication or conversation saving

Convert this into a template for other clients