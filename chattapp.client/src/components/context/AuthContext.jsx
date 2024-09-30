import React, { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState("");
  const navigate = useNavigate();

  const login = async (userName, password) => {
    const response = await fetch("https://localhost:7039/api/Auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName, password }),
    });

    if (response.ok) {
      const data = await response.json();
      const token = data.token;

      sessionStorage.setItem("jwtToken", token);

      setUser(userName);
      navigate("/chat");
      return true;
    } else {
      console.error("Login failed with status:", response.status);
      return false;
    }
  };

  // Register-funktion - använd email, username och password vid registrering
  const register = async (email, userName, password) => {
    const response = await fetch("https://localhost:7039/api/Auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, userName, password }),
    });

    if (response.ok) {
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
