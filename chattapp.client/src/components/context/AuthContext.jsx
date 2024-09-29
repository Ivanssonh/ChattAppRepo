import React, { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(""); // Hantera den inloggade användaren
  const navigate = useNavigate();

  const login = async (userName, password) => {
    const response = await fetch("https://localhost:7039/api/Auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName, password }), // Använd userName
    });

    if (response.ok) {
      const data = await response.json();
      const token = data.token; // Hämta token från svaret

      sessionStorage.setItem("jwtToken", token); // Spara JWT-token i sessionStorage

      setUser(userName); // Sätt användarnamnet
      navigate("/chat"); // Navigera till chatten efter inloggning
      return true;
    } else {
      // Hantera om inloggningen misslyckades
      console.error("Login failed with status:", response.status);
      return false;
    }
  };

  // Register-funktion - använd email, username och password vid registrering
  const register = async (email, userName, password) => {
    const response = await fetch("https://localhost:7039/api/Auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, userName, password }), // Skicka alla tre fälten
    });

    if (response.ok) {
      navigate("/login"); // Navigera till login efter lyckad registrering
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
