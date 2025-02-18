import { createContext, useContext, useState } from "react";
import PropTypes from 'prop-types';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(localStorage.getItem("token")); // Check for token

  const login = (token) => {
    localStorage.setItem("token", token);
    setUser(token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthContext.Provider.propTypes = {
  children: PropTypes.node.isRequired,
};
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
