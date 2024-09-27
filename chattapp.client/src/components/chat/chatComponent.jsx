import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const ChatComponent = () => {
  const { messages, setMessages } = useContext(AuthContext);
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    // Skicka meddelande via SignalR (antag att SignalR-hanteringen finns i AuthContext)
    setMessages((prevMessages) => [
      ...prevMessages,
      { userName: "You", message },
    ]);
    setMessage("");
  };

  return (
    <div className='container'>
      <div className='chat-window'>
        {messages.map((m, index) => (
          <div key={index}>
            <strong>{m.userName}: </strong>
            {m.message}
          </div>
        ))}
      </div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder='Type a message...'
        className='form-control'
      />
      <button className='btn btn-primary mt-2' onClick={sendMessage}>
        Send
      </button>
    </div>
  );
};

export default ChatComponent;
