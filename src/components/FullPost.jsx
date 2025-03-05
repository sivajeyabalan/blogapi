// src/components/FullPost.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const FullPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/posts/${id}/full`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPost(response.data);
      } catch (error) {
        console.error("Error fetching full post details:", error);
        setError("Failed to fetch post details. Please try again.");
      }
    };

    fetchPostDetails();
  }, [id, token]);

  if (!post) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4 bg-background min-h-screen">
      <button
        onClick={() => navigate("/")}
        className="mb-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light"
      >
        Back to Home
      </button>
      <h1 className="text-3xl font-bold text-primary mb-4">{post.title}</h1>
      <p className="text-gray-700 mb-4">{post.content}</p>
      {post.imageUrl && (
        <img
          src={`http://localhost:8080${post.imageUrl}`}
          alt={post.title}
          className="w-full h-48 object-cover mb-4 rounded"
        />
      )}
      <div className="text-sm text-gray-600 mb-2">
        Posted by: {post.author?.email}
      </div>
      <div className="text-sm text-gray-600 mb-2">
        {new Date(post.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
      <div className="border-t pt-3">
        <h3 className="text-sm font-semibold mb-2">Comments</h3>
        {post.comments && post.comments.length > 0 ? (
          <div className="space-y-3">
            {post.comments.map((comment) => (
              <div key={comment.id} className="text-sm">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-800">
                    {comment.author?.email}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {new Date(comment.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">{comment.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No comments available.</p>
        )}
      </div>
    </div>
  );
};

export default FullPost;