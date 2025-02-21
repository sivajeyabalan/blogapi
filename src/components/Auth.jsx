import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
 export const Login = () => {
  const { login } = useAuth(); // ✅ Get login function from AuthContext
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password); // ✅ Calls login from AuthContext
    navigate("/"); // ✅ Redirect to home on success
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      <div className="redirect" ><p> dont have a account <a href="/register">Register</a></p></div>
    </div>
  );
};



export const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:8080/api/auth/register", { email, password });
      console.log(response.data);
      setIsLoading(false);
      navigate("/login");
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" disabled={isLoading}>{isLoading ? "Registering..." : "Register"}</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};
