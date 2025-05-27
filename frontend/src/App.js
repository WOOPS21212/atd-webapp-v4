import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import './App.css';

// Use environment variable or default to localhost for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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

// Questions data structure
const questionSections = [
  {
    title: "Page 2: Questions Asked in Advance",
    page: 2,
    questions: [
      "How are other companies thinking about training and development given today's economic climate?",
      "How do you think about training for younger or junior employees?",
      "What strategies are you using to ensure your training programs are effective and impactful?",
      "What strategies do you use to keep employees engaged in their own development?",
      "How are you thinking about your learning strategy evolving in the next few years?",
      "What are you doing to measure and track employee development?"
    ]
  },
  {
    title: 'Page 3: "Any Questions You\'d Like Us to Bring?"',
    page: 3,
    questions: [
      "What role should AI play in corporate learning?",
      "What signals do you look for to evaluate if someone is 'growing' in their role?",
      "How do you connect learning programs to culture?",
      "What part of the L&D (Learning & Development) landscape feels stuck in the past?",
      "Are there specific leadership or soft skills you're investing in right now?",
      "What's the best piece of training you've ever received?",
      "What training did you receive too late?",
      "How do you assess soft skills growth?",
      "How do you ensure managers are trained to lead in a modern workplace?",
      "What does 'training' even mean anymore?",
      "How do you think about balancing in-person vs digital development experiences?",
      "How do you make development tangible or visible in your organization?",
      "How do you handle high performers who want to keep growing in a flat org?",
      "How do you cultivate a 'learning culture' in a performance culture?"
    ]
  }
];

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [threadId, setThreadId] = useState(null);
  const [pdfPage, setPdfPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const pdfBaseUrl = '/ATD_x_Ammunition_May Responses_Read-Ahead.pdf';

  let scrollTimeout = useRef(null);

  // Function to scroll PDF to a specific page with debounce
  const scrollToPDFPage = (pageNum) => {
    clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      const iframe = document.getElementById('pdf-viewer');
      if (iframe) {
        // Ensure the base URL doesn't already contain a page fragment
        const currentSrc = iframe.src.split('#')[0];
        iframe.src = `${currentSrc}#page=${pageNum}`;
      }
    }, 300);
  };

  useEffect(() => {
    // Scroll to PDF page when pdfPage state changes
    if (pdfPage > 0) {
      scrollToPDFPage(pdfPage);
    }
  }, [pdfPage]);

  useEffect(() => {
    // Fetch threadId on component mount
    const fetchThreadId = async () => {
      try {
        const res = await fetch(`${API_URL}/init`, { method: 'POST' });
        if (!res.ok) {
          throw new Error(`Failed to initialize thread: ${res.status}`);
        }
        const data = await res.json();
        setThreadId(data.threadId);
      } catch (err) {
        console.error("Error initializing threadId:", err);
      }
    };
    fetchThreadId();
  }, []);

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
    if (!input.trim() || !threadId) {
      console.log("Input is empty or threadId is not available.");
      return;
    }

    const newUserMessage = { role: 'user', content: input };
    const updatedMessagesForApi = [...messages, newUserMessage];
    
    setMessages(updatedMessagesForApi);
    setInput('');

    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, messages: updatedMessagesForApi }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullMessage = '';
    
    const assistantMessageIndex = updatedMessagesForApi.length; 
    setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: '...' }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value); 
      console.log('Received chunk:', chunk);
      
      if (chunk === '[DONE]') break;
      fullMessage += chunk;

      // Detect page mentions
      const pageMentionRegex = /page\s+(\d+)/i;
      const match = fullMessage.match(pageMentionRegex);
      if (match) {
        const pageNumber = parseInt(match[1]);
        if (!isNaN(pageNumber) && pageNumber > 0) {
          setPdfPage(pageNumber);
        }
      }

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

  // Handle question selection - auto-send
  const handleQuestionSelect = async (question) => {
    setDrawerOpen(false);
    
    // Check if we have threadId
    if (!threadId) {
      console.log("ThreadId is not available yet.");
      return;
    }

    // Create the message and send it immediately
    const newUserMessage = { role: 'user', content: question };
    const updatedMessagesForApi = [...messages, newUserMessage];
    
    setMessages(updatedMessagesForApi);

    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, messages: updatedMessagesForApi }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullMessage = '';
    
    const assistantMessageIndex = updatedMessagesForApi.length; 
    setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: '...' }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value); 
      console.log('Received chunk:', chunk);
      
      if (chunk === '[DONE]') break;
      fullMessage += chunk;

      // Detect page mentions
      const pageMentionRegex = /page\s+(\d+)/i;
      const match = fullMessage.match(pageMentionRegex);
      if (match) {
        const pageNumber = parseInt(match[1]);
        if (!isNaN(pageNumber) && pageNumber > 0) {
          setPdfPage(pageNumber);
        }
      }

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

  // Filter questions based on search
  const filteredSections = questionSections.map(section => ({
    ...section,
    questions: section.questions.filter(q => 
      q.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.questions.length > 0);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <img src="/logo.png" alt="Logo" className="app-logo" />
            <h1 className="app-title">ATD RFP Assistant</h1>
          </div>
          <div className="header-info">
            {threadId ? (
              <span className="thread-status">Connected</span>
            ) : (
              <span className="thread-status connecting">Connecting...</span>
            )}
          </div>
        </div>
      </header>
      
      <div className="app-layout">
        {/* Question Drawer */}
        <div className={`question-drawer ${drawerOpen ? 'open' : ''}`}>
          <div className="drawer-content">
            <div className="drawer-header">
              <h3>📚 ATD Partnership Questions</h3>
              <button className="close-drawer" onClick={() => setDrawerOpen(false)}>×</button>
            </div>
            <div className="drawer-search">
              <input
                type="text"
                placeholder="🔍 Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="drawer-questions">
              {filteredSections.map((section, sectionIdx) => (
                <div key={sectionIdx} className="question-section">
                  <h4 className="section-title">📄 {section.title}</h4>
                  <ol className="question-list">
                    {section.questions.map((question, qIdx) => (
                      <li 
                        key={qIdx} 
                        className="question-item"
                        onClick={() => handleQuestionSelect(question)}
                      >
                        {question}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
          {/* Drawer Tab */}
          <button 
            className="drawer-tab" 
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-label="Toggle question drawer"
          >
            <span className="tab-text">Questions</span>
            <span className="tab-arrow">{drawerOpen ? '◀' : '▶'}</span>
          </button>
        </div>
        
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
            <form onSubmit={handleSubmit} className="input-row">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about the RFP..."
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
        <div className="pdf-panel">
          <iframe
            id="pdf-viewer"
            key={pdfPage}
            src={`${pdfBaseUrl}#page=${pdfPage}`}
            title="ATD RFP"
            className="pdf-iframe"
          />
        </div>
      </div>
    </div>
  );
}

export default App;