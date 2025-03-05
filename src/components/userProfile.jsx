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
    <div className="container mx-auto p-4 bg-background min-h-screen">
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <div>
          <h1 className="text-3xl font-bold text-primary mb-4">User Profile</h1>
          <p className="text-gray-700">Welcome, {getUsernameFromEmail(user.email)}</p>
          <p className="text-gray-700">Email: {user.email}</p>
          <p className="text-gray-700">Role: {user.role}</p>
          <p className="text-gray-700">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
          <h2 className="text-2xl font-semibold text-primary mt-6 mb-4">Posts</h2>
          {user.posts.length > 0 ? (
            <ul className="space-y-4">
              {user.posts.map((post) => (
                <li key={post.id} className="bg-white p-4 rounded shadow">
                  <h3 className="text-xl font-bold text-gray-900">{post.title}</h3>
                  <p className="text-gray-700">{post.content}</p>
                  <p className="text-sm text-gray-500">Posted on: {new Date(post.createdAt).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No posts available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;