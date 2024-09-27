import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as signalR from "@microsoft/signalr";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  // Login-funktion - använd userName och password här
  const login = async (userName, password) => {
    const response = await fetch("https://localhost:7039/api/Auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName, password }), // Använd userName
    });

    if (response.ok) {
      const data = await response.json();
      setUser(data.user); // Spara användarinformation
      localStorage.setItem("token", data.token);
      navigate("/chat"); // Navigera till chatten efter inloggning
      return true;
    }
    return false;
  };

  // Register-funktion - använd email, username och password vid registrering
  const register = async (email, userName, password) => {
    const response = await fetch("https://localhost:7039/api/Auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, userName, password }), // Skicka alla tre fälten
    });

    if (response.ok) {
      await login(userName, password); // Logga in användaren efter registrering med användarnamn och lösenord
    }
  };

  // Hantera SignalR för chatt
  useEffect(() => {
    if (user) {
      const connection = new signalR.HubConnectionBuilder()
        .withUrl("/chathub")
        .withAutomaticReconnect()
        .build();

      connection.on("ReceiveMessage", (userName, message) => {
        setMessages((prevMessages) => [...prevMessages, { userName, message }]);
      });

      connection.start();
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, login, register, messages, setMessages }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
