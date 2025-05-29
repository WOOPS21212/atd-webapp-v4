import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import PDFViewer from './PDFViewer';
import questionSections from './questionData';
import './errorSuppression'; // Suppress benign ResizeObserver errors
import './App.css';

// Use environment variable or default to localhost for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function debounce(func, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}

// Helper function to fix list formatting
const fixListFormatting = (text) => {
  if (typeof text !== 'string') return text;

  let fixedText = text
    .replace(/([^\n])\n- /g, '$1\n\n- ')
    .replace(/([^\n])\n(\d+\. )/g, '$1\n\n$2')
    .replace(/([.!?:])\n- /g, '$1\n\n- ')
    .replace(/([.!?:])\n(\d+\. )/g, '$1\n\n$2')
    .replace(/【\d+:\d+†[^\]]+】/g, ''); // ✅ Strip citation markers

  return fixedText;
};

const defaultAssistantMessage = {
  role: 'assistant',
  content: `Hi there—Amy here, your digital guide to Ammunition's thinking for ATD.

This portal was built to help you move through the response materials in whatever way works best—whether you're here to validate strategic fit, scan for standout work, or dive deep into specifics.

You can:
- Ask me to simplify or summarize anything on screen
- Use the Questions tab above this chat to spark ideas or shortcuts
- Navigate directly to a section using the strip at the bottom
- Use your left and right arrow keys to flip through the deck quickly

Not sure where to start? Just ask. I'll help you zero in on what matters most to you.`
};

// Typing Indicator Component
const TypingIndicator = () => {
  return (
    <div className="assistant-message">
      <strong>Ammunition Amy: </strong><br />
      <div className="typing-indicator">
        Amy is thinking
        <div className="typing-dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [messages, setMessages] = useState([defaultAssistantMessage]);
  const [input, setInput] = useState('');
  const [threadId, setThreadId] = useState(null);
  const [pdfPage, setPdfPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const sectionRef = useRef(null);
  const pdfUrl = '/ATDxAmmunition_May-29-2025.pdf';


// Table of Contents data - Updated with new sections and page numbers
const tableOfContents = [
  { num: '01', title: 'Strategy', page: 151 },
  { num: '02', title: 'Innovation', page: 179 },
  { num: '03', title: 'Technology', page: 210 },
  { num: '04', title: 'Content', page: 244 },
  { num: '05', title: 'Advertising', page: 269 },
  { num: '06', title: 'Web', page: 329 },
  { num: '07', title: 'Events', page: 368 },
  { num: '08', title: 'Public Relations', page: 391 },
  { num: '09', title: 'Crisis', page: 418 },
  { num: '10', title: 'Production', page: 448 },
  { num: '11', title: 'Fees', page: 488 },
  { num: '12', title: 'Account Management', page: 485 },
  { num: '13', title: 'Analytics', page: 506 },
  { num: '14', title: 'Team', page: 528 },
  { num: '15', title: 'SMEs', page: 541 },
  { num: '16', title: 'Social', page: 558 },
  { num: '17', title: 'Media Buying', page: 602 },
];









  // Go to specific page function
  const goToPage = (page) => {
    setPdfPage(page);
  };

  // Handle page change from PDF viewer
  const handlePdfPageChange = (newPage) => {
    setPdfPage(newPage);
  };

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

  const rawScrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const debouncedScrollToBottom = useRef(debounce(rawScrollToBottom, 150)).current;

  useEffect(() => {
    debouncedScrollToBottom();
  }, [messages, isTyping]);

  // Keyboard navigation for PDF
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only handle arrow keys if no input element is focused
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          if (pdfPage > 1) {
            goToPage(pdfPage - 1);
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          // The PDF viewer will handle the actual bounds checking
          goToPage(pdfPage + 1);
          break;
        default:
          break;
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [pdfPage]); // Dependencies to ensure we have current page state

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
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, messages: updatedMessagesForApi }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullMessage = '';
      
      const assistantMessageIndex = updatedMessagesForApi.length; 
      setIsTyping(false);
      setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: '...' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value); 
        console.log('Received chunk:', chunk);
        
        if (chunk === '[DONE]') break;
        fullMessage += chunk;

        // Detect page/slide mentions with enhanced regex
        const pageMentionRegex = /\b(?:Slide|Page)\s+(\d{1,3})/i;
        const match = fullMessage.match(pageMentionRegex);
        if (match) {
          const pageNumber = parseInt(match[1]);
          if (!isNaN(pageNumber) && pageNumber > 0) {
            setPdfPage(pageNumber);
          }
        }

        // Fix list formatting and add highlighting before updating the message
        let formattedMessage = fixListFormatting(fullMessage);
        // Highlight slide/page references in assistant messages
        formattedMessage = formattedMessage.replace(/\b((?:Slide|Page)\s+\d{1,3})\b/gi, '<span class="highlight-slide">$1</span>');

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
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setIsTyping(false);
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
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, messages: updatedMessagesForApi }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullMessage = '';
      
      const assistantMessageIndex = updatedMessagesForApi.length; 
      setIsTyping(false);
      setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: '...' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value); 
        console.log('Received chunk:', chunk);
        
        if (chunk === '[DONE]') break;
        fullMessage += chunk;

        // Detect page/slide mentions with enhanced regex
        const pageMentionRegex = /\b(?:Slide|Page)\s+(\d{1,3})/i;
        const match = fullMessage.match(pageMentionRegex);
        if (match) {
          const pageNumber = parseInt(match[1]);
          if (!isNaN(pageNumber) && pageNumber > 0) {
            setPdfPage(pageNumber);
          }
        }

        // Fix list formatting and add highlighting before updating the message
        let formattedMessage = fixListFormatting(fullMessage);
        // Highlight slide/page references in assistant messages
        formattedMessage = formattedMessage.replace(/\b((?:Slide|Page)\s+\d{1,3})\b/gi, '<span class="highlight-slide">$1</span>');

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
    } catch (error) {
      console.error('Error in handleQuestionSelect:', error);
      setIsTyping(false);
    }
  };

  // Filter questions based on search
  const filteredSections = questionSections.map(section => ({
    ...section,
    questions: section.questions.filter(q => 
      q.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.questions.length > 0);

  // Section scrolling functions
  const scrollSections = (direction) => {
    const container = sectionRef.current;
    if (!container) return;
    const scrollAmount = 240;
    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollBy({ left: e.deltaY, behavior: 'smooth' });
    };

    el.addEventListener('wheel', handleWheel);
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <img src="/ammunition logo wide.svg" alt="Ammunition Logo" className="app-logo ammunition-logo" />
            <FontAwesomeIcon icon={faPlus} className="logo-plus-icon" />
            <img src="/logo.png" alt="ATD Logo" className="app-logo atd-logo" />
            <h1 className="app-title">Deck Assistant</h1>
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
      
      <div className={`app-layout ${drawerOpen ? 'drawer-open' : ''}`}>
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
        </div>
        
        <div className="chat-panel">
          <button 
            className="drawer-tab-horizontal"
            onClick={() => {
              if (!drawerOpen && !localStorage.getItem('questionDrawerHintSeen')) {
                localStorage.setItem('questionDrawerHintSeen', 'true');
              }
              setDrawerOpen(!drawerOpen);
            }}
          >
            {drawerOpen ? 'Hide Questions' : 'ATD Partnership Questions'}
          </button>
          <div className="chat-container">
            <div className="chat-box">
              {messages.map((msg, index) => (
                <div key={index} className={msg.role === 'user' ? 'user-message' : 'assistant-message'}>
                  <strong>{msg.role === 'user' ? 'You' : 'Ammunition Amy'}: </strong><br />
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
              {isTyping && <TypingIndicator />}
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
          <PDFViewer 
            pdfUrl={pdfUrl}
            currentPage={pdfPage}
            onPageChange={handlePdfPageChange}
          />
        </div>
      </div>
      <div className="section-footer">
        <div className="section-scroll-wrapper">
          <button className="section-scroll-btn left" onClick={() => scrollSections('left')}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>

          <div className="section-scrollbar" ref={sectionRef}>
            {tableOfContents.map((section) => (
              <button
                key={section.num}
                className={`section-item ${pdfPage >= section.page &&
                  (tableOfContents.findIndex(s => s.num === section.num) === tableOfContents.length - 1 ||
                   pdfPage < tableOfContents[tableOfContents.findIndex(s => s.num === section.num) + 1]?.page)
                  ? 'active' : ''}`}
                onClick={() => goToPage(section.page)}
              >
                <span className="section-num">{section.num}</span>
                <span className="section-title">{section.title}</span>
                <span className="section-page">p.{section.page}</span>
              </button>
            ))}
          </div>

          <button className="section-scroll-btn right" onClick={() => scrollSections('right')}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
