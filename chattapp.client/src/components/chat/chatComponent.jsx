import React, { useState, useEffect } from "react";
import * as signalR from "@microsoft/signalr";
import DOMPurify from "dompurify";

const ChatComponent = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState(null);
  const [username, setUsername] = useState(null);
  const [authorized, setAuthorized] = useState(false); // Hanterar behörighet

  useEffect(() => {
    const token = sessionStorage.getItem("jwtToken");
    console.log("JWT Token:", token);

    if (token && !connection) {
      const decodedJwt = JSON.parse(atob(token.split(".")[1]));
      setUsername(decodedJwt.unique_name); // Sätt användarnamnet från JWT-token
      setAuthorized(true);

      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:7039/chathub", {
          accessTokenFactory: () => token, // Skicka JWT-token med varje förfrågan
        })
        .withAutomaticReconnect()
        .build();

      setConnection(newConnection);

      newConnection
        .start()
        .then(() => {
          console.log("Connected to the hub.");
        })
        .catch((err) => console.error("Connection error:", err));
    }

    // Cleanup anslutningen vid unmount
    return () => {
      if (connection) {
        connection.stop().then(() => console.log("SignalR connection stopped"));
      }
    };
  }, [connection]); // Se till att useEffect endast körs om connection ändras

  const sendMessage = async () => {
    if (connection && message.trim()) {
      try {
        await connection.send("SendMessage", username, message);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            user: "You",
            message: DOMPurify.sanitize(message, { ALLOWED_TAGS: ["b"] }),
          },
        ]);
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
    if (connection) {
      connection
        .stop()
        .then(() => {
          sessionStorage.removeItem("jwtToken");
          window.location.href = "/";
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
                  <strong>{msg.user}:</strong> {msg.message}
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
                  disabled={!connection} // Inaktivera input om anslutningen inte finns
                />
                <button
                  className='btn btn-primary'
                  onClick={sendMessage}
                  disabled={!connection || !message.trim()}
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
