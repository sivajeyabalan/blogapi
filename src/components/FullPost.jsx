// src/components/FullPost.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// Use hardcoded URL instead of environment variables
const BASE_URL = "https://blog-backend-77ds.onrender.com";

const FullPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [editComment, setEditComment] = useState(null);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/posts/${id}/full`, {
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

  const handleEditComment = (comment) => {
    setEditComment(comment);
  };

  const handleUpdateComment = async (commentId, updatedContent) => {
    try {
      await axios.put(
        `${BASE_URL}/api/comments/${commentId}`,
        { content: updatedContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Refresh post to reflect updated comment
      const response = await axios.get(`${BASE_URL}/api/posts/${id}/full`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPost(response.data);
      setEditComment(null);
    } catch (error) {
      console.error("Error updating comment:", error);
      setError("Failed to update comment. Please try again.");
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => navigate("/")}
          className="mb-8 px-6 py-3 bg-white text-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2 font-semibold"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          <span>Back to Home</span>
        </button>

        <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {post.imageUrl && (
            <div className="w-full h-96 relative">
              <img
                src={`${BASE_URL}${post.imageUrl}`}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">
              {post.title}
            </h1>

            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {post.author?.email}
                  </p>
                </div>
              </div>
              <span className="text-gray-300">•</span>
              <time className="text-gray-500">
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </div>

            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-gray-700 leading-relaxed">{post.content}</p>
            </div>

            {/* Comments Section */}
            <div className="border-t border-gray-100 pt-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Comments
              </h3>
              {post.comments && post.comments.length > 0 ? (
                <div className="space-y-6">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-blue-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {comment.author?.email}
                            </p>
                            <time className="text-sm text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </time>
                          </div>
                        </div>
                        {comment.authorId ===
                          parseInt(localStorage.getItem("userId")) && (
                          <button
                            onClick={() => handleEditComment(comment)}
                            className="text-blue-500 hover:text-blue-700 font-semibold text-sm transition-colors"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                      {editComment && editComment.id === comment.id && (
                        <div className="mt-4 space-y-4">
                          <textarea
                            value={editComment.content}
                            onChange={(e) =>
                              setEditComment({
                                ...editComment,
                                content: e.target.value,
                              })
                            }
                            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                            rows="4"
                          />
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() =>
                                handleUpdateComment(
                                  comment.id,
                                  editComment.content
                                )
                              }
                              className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => setEditComment(null)}
                              className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default FullPost;
