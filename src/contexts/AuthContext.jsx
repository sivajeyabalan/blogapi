import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Prevents infinite login loops

  // Function to fetch authenticated user
  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false); // ✅ Stop loading if no token is found
      return;
    }

    try {
      const res = await axios.get("http://localhost:8080/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (error) {
      console.error(
        "Error fetching user:",
        error.response?.data || error.message
      );
      logout(); // If token is invalid, log out the user
    } finally {
      setLoading(false);
    }
  };

  // Function to log in
  const login = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", {
        email,
        password,
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token); // Store token
        localStorage.setItem("userId", res.data.user.id); // Store user ID
        await fetchUser(); // Fetch user after login
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
    }
  };

  // Function to log out
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setUser(null);
  };

  // Run fetchUser() only once on page load
  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Show loading indicator before rendering anything
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
