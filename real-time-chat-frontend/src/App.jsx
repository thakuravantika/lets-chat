import socket from "./socket";
import {useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("currentUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [showRegister, setShowRegister] = useState(false);

  const handleLoginSuccess = (userData) => {
    const { token, ...user } = userData;

    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("token", token);

    setCurrentUser(user);
  };

  const handleLogout = () => {
    socket.disconnect();
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");

    setCurrentUser(null);
  };



  useEffect(() => {
    if (!currentUser) return;
    
    const token = localStorage.getItem("token");

    if (!token) return;

    socket.auth = {token};
    socket.connect();

    return () => {
      socket.disconnect();
    };
    
  }, [currentUser]);


  return currentUser ?(
      <Dashboard currentUser={currentUser}
      onLogout={handleLogout}
      />
  ) : showRegister ? (
    <Register onSwitchToLogin={() => setShowRegister(false)} />
  ) : (
    <Login onLoginSuccess={handleLoginSuccess} />
  );
}

export default App;