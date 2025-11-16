import React, { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./Chatboard.css";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const Chatboard = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 Hi! I'm  your Career AI Assistant. Ask me anything about software engineering careers, interview prep, resume tips, or job search advice!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prevMes) => [...prevMes, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });

      const prompt = `You are an expert career mentor focused on software engineering paths.
      Respond with:
      - A short, empathetic intro (1–2 sentences).
      - Section headings using **bold**.
      - Bullet points for steps, lists, or recommendations.
      - Very minimal bold emphasis inside paragraphs.
      - No overuse of formatting symbols.
      Make the tone supportive, professional, and actionable. User question: ${userMessage.content} `;

      const result = await model.generateContent(prompt);

      const response = result.response;
      const aiResponse = response.text();

      const aiMessage: Message = {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages((prevMes) => [...prevMes, aiMessage]);
    } catch (error) {
      console.log("Error:", error);

      const aiErrorResponse =
        "❌ Sorry, I'm having trouble responding right now. Please try again in a moment.";

      const errorMessage: Message = {
        role: "assistant",
        content: aiErrorResponse,
        timestamp: new Date(),
      };

      setMessages((prevMes) => [...prevMes, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "How do I write a good resume?",
    "Prepare me for a React interview",
    "What skill should I learn?",
    "How do I find my next job",
  ];

  return (
    <div className="chatbot_container">
      <div className="chatbot_header">
        <h1 className="header_title">
          <span>🤖</span>
          Career AI Assistant
        </h1>
        <p className="header_subtitle">Powered by Google Gemini AI</p>
      </div>

      <div className="messages_container">
        <div className="messages_wrapper">
          {messages.length === 1 && (
            <div className="suggested_questions">
              <p className="suggested_title">💡Try asking </p>
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
          )}

          {messages.map((msg, index) => (
            <div key={index} className={`message_row ${msg.role}`}>
              <div className={`message_bubble ${msg.role}`}>
                <div className="message_content-wrapper">
                  <span className="message_icon">
                    {msg.role === "user" ? "👤" : "🤖"}
                  </span>
                  <div className="message_text-wrapper">
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
            </div>
          ))}

          {loading && (
            <div className="loading_container">
              <div className="loading_bubble">
                <div className="loading_content">
                  <span className="message_icon">🤖</span>
                  <div className="loading_dots">
                    <div className="loading_dot"></div>
                    <div className="loading_dot"></div>
                    <div className="loading_dot"></div>
                  </div>
                  <span className="loading_text">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef}></div>
        </div>
      </div>

      <div className="input-container">
        <div className="input-wrapper">
          <div className="input-row">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about resumes, interviews, job search, skills..."
              className="input-textarea"
              rows={2}
              disabled={loading}
              onKeyDown={handleKeyPress}
            />
            <button
              className="send-button"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              {loading ? "⏳" : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Chatboard;
