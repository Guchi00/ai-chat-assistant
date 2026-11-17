import React, { useState, useRef, useEffect } from "react";
import "./Chatbot.css";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 Hi! I'm your Career AI Assistant. Ask me anything about software engineering careers, interview prep, resume tips, or job search advice!",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async () => {
    const message = input.trim();

    if (!message || loading || message.length > 2000) return;

    const userMessage: Message = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prevMes) => [...prevMes, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed: ${response.status}`);
      }

      const data: { reply: string } = await response.json();

      if (typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("Invalid AI response");
      }

      const aiMessage: Message = {
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages((prevMes) => [...prevMes, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);

      const errorMessage: Message = {
        role: "assistant",
        content:
          "Sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date(),
      };

      setMessages((prevMes) => [...prevMes, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "How do I write a good resume?",
    "Prepare me for a React interview",
    "What skill should I learn?",
    "How do I find my next job?",
  ];

  return (
    <div className="chatbot_container">
      <header className="chatbot_header">
        <div className="header_brand">
          <div className="header_logo">✦</div>

          <div>
            <h1 className="header_title">Career AI Assistant</h1>
            <p className="header_subtitle">Your AI-powered career companion</p>
          </div>
        </div>

        <div className="status_badge">
          <span className="status_dot"></span>
          AI Assistant
        </div>
      </header>

      <main className="messages_container">
        <div className="messages_wrapper">
          {messages.length === 1 && (
            <section className="welcome_section">
              <div className="welcome_icon">✦</div>

              <h2>Your next career move starts here</h2>

              <p>
                Get practical advice on interviews, resumes, software
                engineering and career growth.
              </p>

              <div className="suggested_questions">
                <p className="suggested_title">Try asking</p>

                <div className="suggested_buttons">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      className="suggested_button"
                      onClick={() => setInput(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {messages.map((msg, index) => (
            <div key={index} className={`message_row ${msg.role}`}>
              <div className="message_avatar">
                {msg.role === "user" ? "U" : "✦"}
              </div>

              <div className={`message_bubble ${msg.role}`}>
                <div className="message_text_wrapper">
                  <p className="message_text">{msg.content}</p>

                  <p className="message_timestamp">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="loading_container" role="status">
              <div className="message_avatar">✦</div>

              <div className="loading_bubble">
                <div className="loading_dots">
                  <span className="loading_dot"></span>
                  <span className="loading_dot"></span>
                  <span className="loading_dot"></span>
                </div>

                <span className="loading_text">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef}></div>
        </div>
      </main>

      <footer className="input_container">
        <div className="input_wrapper">
          <div className="input_row">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your career..."
              className="input_textarea"
              rows={2}
              maxLength={2000}
              disabled={loading}
              onKeyDown={handleKeyPress}
              aria-label="Your message"
            />

            <button
              type="button"
              className="send_button"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              {loading ? "Wait..." : "Send ↗"}
            </button>
          </div>

          <div className="input_footer">
            <span>Powered by Google Gemini</span>
            <span>{input.length}/2000</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
