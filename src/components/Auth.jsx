import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      setUsername(username);
      setPassword(password);
      axios.post("/api/login", { username, password })
      .then(response  => {
        setUser(response.data.user);
        setIsLoggedIn(true);
        setIsLoading(false);
        navigate("/");
      })
      } catch (error) {
        setError(error.response?.data?.message || "Invalid username or password");
        setIsLoading(false);
      }
    };
  
    return (
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Login</button>
          </div>
        </form>
        {error && <p className="error">{error}</p>}
        {isLoading && <p>Loading...</p>}
        {isLoggedIn && <p>Logged in as {user.username}</p>}
      </div>
    );
  };
  
  export default Login;
