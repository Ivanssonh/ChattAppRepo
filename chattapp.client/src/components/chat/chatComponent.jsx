import React, { useState, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import DOMPurify from "dompurify";

const ChatComponent = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const connectionRef = useRef(null); // Använd ref för att hålla anslutningen
  const [username, setUsername] = useState(null);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("jwtToken");
    console.log("JWT Token:", token);

    if (token && !connectionRef.current) {
      const decodedJwt = JSON.parse(atob(token.split(".")[1]));
      setUsername(decodedJwt.unique_name);
      setAuthorized(true);

      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:7039/chathub", {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .build();

      connectionRef.current = newConnection;

      newConnection
        .start()
        .then(() => {
          console.log("Connected to the hub.");

          newConnection.on("ReceiveMessage", (userName, message, timestamp) => {
            console.log("Received message from:", userName, message);
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                user: userName,
                message: DOMPurify.sanitize(message, { ALLOWED_TAGS: ["b"] }),
                timestamp,
              },
            ]);
          });
        })
        .catch((err) => console.error("Connection error:", err));
    }

    return () => {
      if (connectionRef.current) {
        connectionRef.current
          .stop()
          .then(() => console.log("SignalR connection stopped"));
        connectionRef.current = null; // Rensa anslutningen
      }
    };
  }, []); // Se till att detta endast körs en gång

  const sendMessage = async () => {
    if (connectionRef.current && message.trim()) {
      try {
        await connectionRef.current.send("SendMessage", message);
        console.log("Message sent:", message);
        setMessage(""); // Rensa meddelandefältet
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && message.trim()) {
      sendMessage();
    }
  };

  const logOut = () => {
    if (connectionRef.current) {
      connectionRef.current
        .stop()
        .then(() => {
          sessionStorage.removeItem("jwtToken");
          window.location.href = "/login";
        })
        .catch((err) => console.error("Error while stopping connection:", err));
    } else {
      sessionStorage.removeItem("jwtToken");
      window.location.href = "/";
    }
  };

  if (!authorized) {
    return (
      <div>
        <p>You are not authorized! ⛔</p>
      </div>
    );
  }

  return (
    <div className='container mt-4'>
      <div className='row'>
        <div className='col-12'>
          <div className='card'>
            <div className='card-header bg-primary text-white'>
              <h5>Chat - Logged in as {username}</h5>
              <button
                onClick={logOut}
                className='btn btn-danger btn-sm float-end'
              >
                Log Out
              </button>
            </div>
            <div
              className='card-body chat-window'
              style={{ height: "300px", overflowY: "scroll" }}
            >
              {messages.map((msg, index) => (
                <div key={index} className='mb-3'>
                  <strong>{msg.user}:</strong> {msg.message}{" "}
                  <span className='text-muted' style={{ fontSize: "0.8rem" }}>
                    ({msg.timestamp})
                  </span>
                </div>
              ))}
            </div>
            <div className='card-footer'>
              <div className='input-group'>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Type a message...'
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!connectionRef.current} // Inaktivera input om anslutningen inte finns
                />
                <button
                  className='btn btn-primary'
                  onClick={sendMessage}
                  disabled={!connectionRef.current || !message.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
