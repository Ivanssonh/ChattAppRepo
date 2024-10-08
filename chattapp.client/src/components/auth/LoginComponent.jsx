// Importer och initialisering av komponenter och kontext
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./LoginComponent.css";

const LoginComponent = () => {
  // State för användarnamn, lösenord och felmeddelanden
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Hämtar login-funktionen från AuthContext och för navigering
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Funktion som hanterar inloggningslogiken vid formulärskick
  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate("/chat");
    } else {
      setErrorMessage("Invalid username or password. Please try again.");
    }
  };

  return (
    <div className='form-container'>
      <div className='form-header'>
        <div className='form-header-image'></div>
        <div className='form-header-text'></div>
      </div>
      <div className='form-div container'>
        <h1>Login</h1>
        {errorMessage && (
          <div className='alert alert-danger' role='alert'>
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleLogin} className='form'>
          <div className='form-group'>
            <label className='form-label'>Username</label>
            <input
              type='text'
              className='form-control'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder='Enter your username'
              required
            />
          </div>
          <div className='form-group'>
            <label className='form-label'>Password</label>
            <input
              type='password'
              className='form-control'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Enter your password'
              required
            />
          </div>
          <button type='submit' className='btn btn-primary mt-3'>
            Login
          </button>
        </form>
        <p>
          Don't have an account?{" "}
          <span className='span-link' onClick={() => navigate("/register")}>
            Sign up.
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginComponent;
