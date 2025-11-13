import React, { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./Chatboard.css";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const Chatboard = () => {
  const [message, setMessage] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 Hi! I'm  your Career AI Assistant. Ask me anything about software engineering careers, interview prep, resume tips, or job search advice!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  return (
    <div className="container">
      Chatboard
      <p></p>
      <div className="user_actions">
        <textarea className="prompt" />
        <button className="btn">Send</button>
      </div>
    </div>
  );
};
export default Chatboard;
