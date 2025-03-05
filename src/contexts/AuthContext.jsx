import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";

const AuthContext = createContext();

const BASE_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Prevents infinite login loops

  // Function to fetch authenticated user
  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Fetch user response:", res.data); // Log the user data

      // Ensure we have a user ID
      const userId = res.data.id || res.data.userId;
      if (userId) {
        localStorage.setItem("userId", userId);
        console.log("Updated userId from /me endpoint:", userId);
      }

      setUser(res.data);
    } catch (error) {
      console.error(
        "Error fetching user:",
        error.response?.data || error.message
      );
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Function to log in
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      console.log("Login response:", res.data); // Log the full response

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);

        // Handle different possible response structures
        const userId = res.data.user?.id || res.data.userId || res.data.id;

        if (userId) {
          localStorage.setItem("userId", userId);
          console.log("Stored userId:", userId); // Log the stored userId
        } else {
          console.warn("No userId found in response:", res.data);
        }

        await fetchUser();
      } else {
        throw new Error("No token received from server");
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      throw error;
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
