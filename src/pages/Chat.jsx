import React, { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useNavigate } from "react-router-dom";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(false);
  const [dark, setDark] = useState(true);

  const stompRef = useRef(null);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  const username = localStorage.getItem("username");

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8081/ws"),
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);

        client.subscribe("/topic/messages", msg => {
          setMessages(prev => [...prev, JSON.parse(msg.body)]);
        });
      },
      onDisconnect: () => setConnected(false)
    });

    client.activate();
    stompRef.current = client;

    return () => client.deactivate();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!connected || !text.trim()) return;

    stompRef.current.publish({
      destination: "/app/chat",
      body: JSON.stringify({
        sender: username,
        content: text
      })
    });

    setText("");
  };

  const handleKey = e => {
    if (e.key === "Enter") sendMessage();
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div style={{
      ...styles.page,
      background: dark ? "#0f172a" : "#f8fafc",
      color: dark ? "white" : "black"
    }}>
      <div style={styles.header}>
        💬 Live Chat
        <div>
          <button onClick={() => setDark(!dark)} style={styles.toggle}>
            {dark ? "☀️" : "🌙"}
          </button>
          <button onClick={logout} style={styles.logout}>Logout</button>
        </div>
      </div>

      <div style={styles.chatBox}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: m.sender === username ? "flex-end" : "flex-start",
            marginBottom: "10px"
          }}>
            <div style={{
              ...styles.bubble,
              background: m.sender === username ? "#38bdf8" : "#22c55e",
              color: "black"
            }}>
              <small>{m.sender}</small>
              <div>{m.content}</div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div style={styles.inputBar}>
        <input
          style={styles.input}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder={connected ? "Type message..." : "Connecting..."}
          disabled={!connected}
        />
        <button
          style={{
            ...styles.sendBtn,
            opacity: connected ? 1 : 0.5
          }}
          onClick={sendMessage}
          disabled={!connected}
        >
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    flexDirection: "column"
  },
  header: {
    padding: "15px",
    fontSize: "20px",
    background: "#020617",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  toggle: {
    marginRight: "10px",
    background: "transparent",
    border: "none",
    fontSize: "18px",
    cursor: "pointer"
  },
  logout: {
    background: "#ef4444",
    border: "none",
    color: "white",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer"
  },
  chatBox: {
    flex: 1,
    padding: "20px",
    overflowY: "auto"
  },
  bubble: {
    padding: "10px 15px",
    borderRadius: "12px",
    maxWidth: "60%"
  },
  inputBar: {
    display: "flex",
    padding: "15px",
    background: "#020617"
  },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    outline: "none"
  },
  sendBtn: {
    marginLeft: "10px",
    background: "#38bdf8",
    border: "none",
    padding: "12px 18px",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer"
  }
};

export default Chat;