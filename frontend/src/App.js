import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import './App.css';

// Helper function to fix list formatting
const fixListFormatting = (text) => {
  if (typeof text !== 'string') return text;
  
  // Fix bullet lists: ensure proper line breaks before list items
  let fixedText = text.replace(/([^\n])\n- /g, '$1\n\n- ');
  
  // Fix numbered lists: ensure proper line breaks before numbered items
  fixedText = fixedText.replace(/([^\n])\n(\d+\. )/g, '$1\n\n$2');
  
  // Ensure lists start with proper line break if they come after text
  fixedText = fixedText.replace(/([.!?:])\n- /g, '$1\n\n- ');
  fixedText = fixedText.replace(/([.!?:])\n(\d+\. )/g, '$1\n\n$2');
  
  return fixedText;
};

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [threadId, setThreadId] = useState(null); // Added threadId state
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch threadId on component mount
    const fetchThreadId = async () => {
      try {
        const res = await fetch('https://atd-webapp-v4.onrender.com/init', { method: 'POST' });
        if (!res.ok) {
          throw new Error(`Failed to initialize thread: ${res.status}`);
        }
        const data = await res.json();
        setThreadId(data.threadId);
      } catch (err) {
        console.error("Error initializing threadId:", err);
        // Optionally, set an error state to display to the user
      }
    };
    fetchThreadId();
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !threadId) { // Added check for threadId
      console.log("Input is empty or threadId is not available.");
      return;
    }

    const newUserMessage = { role: 'user', content: input };
    // This array includes the new user message and will be sent to the backend.
    const updatedMessagesForApi = [...messages, newUserMessage];
    
    setMessages(updatedMessagesForApi); // Update UI with user message
    setInput('');

    const response = await fetch('http://localhost:5000/chat', { // Changed to /chat
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, messages: updatedMessagesForApi }), // Send threadId and updated messages
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullMessage = '';
    
    // assistantMessageIndex is the index at which the new assistant message placeholder will be added.
    // It's the length of the array that *already includes* the new user message.
    const assistantMessageIndex = updatedMessagesForApi.length; 
    setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: '...' }]); // Adds placeholder

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value); 
      console.log('Received chunk:', chunk); // Debug log to verify chunks arrive
      
      // The chunk already contains the content, no need to parse SSE format
      if (chunk === '[DONE]') break; // Check for DONE marker directly
      fullMessage += chunk; // Add chunk directly to fullMessage

      // Fix list formatting before updating the message
      const formattedMessage = fixListFormatting(fullMessage);

      setMessages((prevMessages) => {
        const updated = [...prevMessages];
        if (updated[assistantMessageIndex] && updated[assistantMessageIndex].role === 'assistant') {
            updated[assistantMessageIndex] = {
                role: 'assistant',
                content: formattedMessage,
            };
        }
        return updated;
      });
    }
  };

  return (
    <div className="app-layout">
      <div className="chat-panel">
        <div className="chat-container">
          <div className="chat-box">
            {messages.map((msg, index) => (
              <div key={index} className={msg.role === 'user' ? 'user-message' : 'assistant-message'}>
                <strong>{msg.role === 'user' ? 'You' : 'Assistant'}: </strong><br />
                {msg.role === 'assistant' ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    components={{
                      ul: (props) => <ul style={{ paddingLeft: '1.5em', marginBottom: '1em' }} {...props} />,
                      ol: (props) => <ol style={{ paddingLeft: '1.5em', marginBottom: '1em' }} {...props} />,
                      li: (props) => <li style={{ marginBottom: '0.5em' }} {...props} />,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <span>{msg.content}</span>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
            />
            <button type="submit">Send</button>
          </form>
        </div>
      </div>
      <div className="pdf-panel">
        <iframe
          src="/ATD-RFP-Response.pdf"
          title="ATD RFP"
          className="pdf-iframe"
        />
      </div>
    </div>
  );
}

export default App;
