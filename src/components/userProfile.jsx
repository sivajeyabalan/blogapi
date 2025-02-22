import { useState, useEffect } from 'react';
import axios from 'axios';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  const userId = localStorage.getItem("userId");
  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response.data.message);
        setLoading(false);
      });
  }, [token, userId]);

  const getUsernameFromEmail = (email) => {
    return email.split('@')[0];
  };

  return (
    <div className="container mx-auto p-4">
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-4">User Profile</h1>
          <p>Welcome, {getUsernameFromEmail(user.email)}</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
          <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
          <h2 className="text-xl font-semibold mt-6 mb-4">Posts</h2>
          {user.posts.length > 0 ? (
            <ul>
              {user.posts.map((post) => (
                <li key={post.id} className="mb-2">
                  <h3 className="text-lg font-bold">{post.title}</h3>
                  <p>{post.content}</p>
                  <p className="text-sm text-gray-500">Posted on: {new Date(post.createdAt).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No posts available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;