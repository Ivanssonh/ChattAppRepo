import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./RegisterComponent.css"; // Importera din CSS-fil

const RegisterComponent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(email, username, password);
    navigate("/login"); // Navigera till login efter registrering
  };

  return (
    <div className='form-container'>
      <div className='form-header'>
        <div className='form-header-image'></div>
        <div className='form-header-text'></div>
      </div>
      <div className='form-div container'>
        <h1>Sign Up</h1>
        <form onSubmit={handleSubmit} className='form'>
          <div className='form-group'>
            <label className='form-label'>Email</label>
            <input
              type='email'
              className='form-control'
              placeholder='Enter your email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className='form-group'>
            <label className='form-label'>Username</label>
            <input
              type='text'
              className='form-control'
              placeholder='Enter your username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className='form-group'>
            <label className='form-label'>Password</label>
            <input
              type='password'
              className='form-control'
              placeholder='Enter your password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type='submit' className='btn btn-primary mt-3'>
            Sign Up
          </button>
        </form>
        <p>
          Already have an account?{" "}
          <span className='span-link' onClick={() => navigate("/login")}>
            Sign in.
          </span>
        </p>
      </div>
    </div>
  );
};

export default RegisterComponent;
