import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as signalR from "@microsoft/signalr";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  // Login-funktion
  const login = async (email, password) => {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
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

  // Register-funktion
  const register = async (email, password) => {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      await login(email, password); // Logga in användaren efter registrering
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
