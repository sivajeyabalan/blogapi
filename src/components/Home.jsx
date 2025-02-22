import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [posts, setPost] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  if (!token) {
    console.log(token + "token error");
  }

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/posts/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setPost(res.data))
      .catch((err) => console.log(err));
  }, [token]);

  const handleProfileRedirect = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        navigate("/profile");
      }
    } catch (error) {
      console.error("Error accessing profile:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="profile-redirect mb-4">
        <button onClick={handleProfileRedirect} className="text-blue-500 hover:underline">
          Go to Profile
        </button>
      </div>
      {posts ? <h1 className="text-2xl font-bold mb-4">Blog Posts</h1> : <p>Loading...</p>}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="post p-6 border rounded-lg shadow-lg bg-white">
              <h2 className="text-xl font-semibold mb-4">{post.title}</h2>
              {post.imageUrl && (
                <>
                  <img src={`http://localhost:8080${post.imageUrl}`} alt={post.title} className="w-full h-48 object-cover mb-4 rounded" />
                </>
              )}
              <p className="text-gray-700">{post.content.substring(0, 100)}...</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No posts available.</p>
      )}
      <p className="mt-6">
        <a href="/create-post" className="text-blue-500 hover:underline">Create Post</a>
        <br />
      </p>
    </div>
  );
};

export default Home;