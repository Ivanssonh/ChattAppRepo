import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginComponent from "./components/auth/LoginComponent";
import RegisterComponent from "./components/auth/RegisterComponent";
import ChatComponent from "./components/chat/chatComponent";
import AuthProvider from "./components/context/AuthContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path='/login' element={<LoginComponent />} />
          <Route path='/register' element={<RegisterComponent />} />
          <Route path='/chat' element={<ChatComponent />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
