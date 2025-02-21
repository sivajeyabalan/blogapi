import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

   // Shows loading only briefly

  return user ? children : <Navigate to="/login" />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;

