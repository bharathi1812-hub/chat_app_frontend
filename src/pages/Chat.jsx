import React, { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useNavigate } from "react-router-dom";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [stompClient, setStompClient] = useState(null);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  const username = localStorage.getItem("username");

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8081/ws"),
      connectHeaders: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      onConnect: () => {
        client.subscribe("/topic/messages", (msg) => {
          setMessages((prev) => [...prev, JSON.parse(msg.body)]);
        });
      },
    });

    client.activate();
    setStompClient(client);

    return () => client.deactivate();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!stompClient || !text.trim()) return;

    stompClient.publish({
      destination: "/app/chat",
      body: JSON.stringify({
        sender: username,
        content: text,
      }),
    });

    setText("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        💬 Live Chat
        <button onClick={logout} style={styles.logout}>
          Logout
        </button>
      </div>

      <div style={styles.chatBox}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent:
                m.sender === username ? "flex-end" : "flex-start",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                ...styles.bubble,
                background:
                  m.sender === username ? "#38bdf8" : "#22c55e",
              }}
            >
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
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type message..."
        />
        <button style={styles.sendBtn} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#0f172a",
    color: "white",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "15px",
    fontSize: "20px",
    background: "#020617",
    display: "flex",
    justifyContent: "space-between",
  },
  logout: {
    background: "#ef4444",
    border: "none",
    color: "white",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  chatBox: {
    flex: 1,
    padding: "15px",
    overflowY: "auto",
  },
  bubble: {
    padding: "10px 14px",
    borderRadius: "12px",
    maxWidth: "60%",
  },
  inputBar: {
    display: "flex",
    padding: "10px",
    background: "#020617",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    outline: "none",
  },
  sendBtn: {
    marginLeft: "10px",
    background: "#38bdf8",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default Chat;