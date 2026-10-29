import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatList from '../components/ChatList';
import ChatInput from '../components/ChatInput';
import AboutModal from '../components/AboutModal';

const STORAGE_KEY = 'legalmind_chat_history_v2';

function Home() {
  // Load conversation from localStorage
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Failed to parse saved chat history:', e);
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const bottomRef = useRef(null);

  // Sync messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save chat to localStorage:', e);
    }
  }, [messages]);

  // Auto-scroll to bottom inside the chat container when messages update or loading starts
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const showToast = (msg, duration = 4000) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, duration);
  };

  const handleSendMessage = async (textToSend) => {
    if (!textToSend || loading) return;

    const userMessageId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const userMessage = {
      id: userMessageId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    // Optimistically update conversation
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setDraftText('');
    setLoading(true);

    // Prepare previous history for the backend context (last 6 items)
    const historyPayload = updatedMessages
      .slice(-6)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      const apiUrl = '/user-query/case-details';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          formData: textToSend,
          history: historyPayload
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorDetail = data?.error || `Server responded with status ${response.status}`;
        throw new Error(errorDetail);
      }

      if (!data?.summary) {
        throw new Error('Received an empty response from the analysis engine.');
      }

      const assistantMessage = {
        id: `ai_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        sender: 'assistant',
        text: data.summary,
        timestamp: data.timestamp || new Date().toISOString()
      };

      setMessages((prev) => [...prev, assistantMessage]);

    } catch (err) {
      console.error('[LegalMind] Query Error:', err);

      let friendlyError = err.message;
      if (err.name === 'AbortError') {
        friendlyError = 'Request timed out after 60 seconds. The analysis service is currently busy.';
      }

      showToast(`Error: ${friendlyError}`);

      // Also append error state to the assistant turn so the user can easily retry
      const assistantErrorMessage = {
        id: `ai_err_${Date.now()}`,
        sender: 'assistant',
        text: 'An error occurred while generating the legal analysis for this inquiry.',
        error: friendlyError,
        retryQuery: textToSend,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, assistantErrorMessage]);

    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear your current conversation history?')) {
      setMessages([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.warn(e);
      }
      showToast('Conversation history cleared.');
    }
  };

  const handleExportChat = () => {
    if (messages.length === 0) return;

    let transcript = `# LegalMind AI — Case Analysis Transcript\n`;
    transcript += `*Generated on: ${new Date().toLocaleString()}*\n\n---\n\n`;

    messages.forEach((m, idx) => {
      const role = m.sender === 'user' ? 'USER' : 'LEGALMIND AI';
      transcript += `### ${idx + 1}. ${role} (${new Date(m.timestamp).toLocaleTimeString()})\n\n`;
      transcript += `${m.text}\n\n---\n\n`;
    });

    transcript += `\n*Disclaimer: For informational and research purposes only. Not formal legal advice.*`;

    const blob = new Blob([transcript], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `legalmind-transcript-${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Conversation exported as Markdown.');
  };

  const handleSelectSample = (samplePrompt) => {
    setDraftText(samplePrompt);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-warning bg-amber-950/90 border border-amber-600/50 text-amber-200 text-xs sm:text-sm shadow-xl backdrop-blur-md">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header (fixed at top) */}
      <Header
        onClearChat={handleClearChat}
        onExportChat={handleExportChat}
        onOpenAbout={() => setIsAboutOpen(true)}
        hasMessages={messages.length > 0}
      />

      {/* Main Chat Scrollable Container */}
      <div className="flex-1 overflow-y-auto overscroll-contain chat-scroll-container">
        <ChatList
          messages={messages}
          loading={loading}
          onSelectSample={handleSelectSample}
          bottomRef={bottomRef}
          onRetry={handleSendMessage}
        />
      </div>

      {/* Input Area (fixed above footer) */}
      <div className="flex-shrink-0 z-30 bg-slate-950/95 border-t border-slate-900/60 pt-3 pb-1 backdrop-blur-md">
        <ChatInput
          onSendMessage={handleSendMessage}
          loading={loading}
          draftText={draftText}
          setDraftText={setDraftText}
        />
      </div>

      {/* Footer (fixed at bottom) */}
      <div className="flex-shrink-0">
        <Footer onOpenAbout={() => setIsAboutOpen(true)} />
      </div>

      {/* About & Disclaimer Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
}

export default Home;
