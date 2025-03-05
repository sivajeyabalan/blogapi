import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL;

const Home = () => {
  const [posts, setPost] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [fullPost, setFullPost] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${BASE_URL}/api/posts/paginated?page=${page}&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Ensure we're handling an array of posts
      let postsData = Array.isArray(response.data.posts)
        ? response.data.posts
        : [];

      console.log("Fetched posts data:", response.data);
      console.log("Posts array:", postsData);

      setPost(postsData);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch posts. Please try again later."
      );
      setPost([]);
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  // Update handleComment to refresh posts after adding a comment
  const handleComment = async (postId) => {
    if (!commentText[postId]?.trim()) return;

    try {
      setError(null);
      await axios.post(
        `${BASE_URL}/api/posts/${postId}/comment`,
        { content: commentText[postId] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCommentText((prev) => ({ ...prev, [postId]: "" }));
      // Refresh posts after adding a comment
      fetchPosts(currentPage);
    } catch (error) {
      setError("Failed to add comment. Please try again.");
      console.error("Error adding comment:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  // Update handleLike to refresh posts after liking
  const handleLike = async (postId) => {
    try {
      setError(null);
      await axios.post(
        `${BASE_URL}/api/posts/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Refresh posts after liking
      fetchPosts(currentPage);
    } catch (error) {
      setError("Failed to like post. Please try again.");
      console.error("Error liking post:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const handleCommentChange = (postId, value) => {
    setCommentText((prev) => ({ ...prev, [postId]: value }));
  };

  const handleProfileRedirect = async () => {
    try {
      setError(null);
      const response = await axios.get(`${BASE_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        navigate("/profile");
      }
    } catch (error) {
      setError("Failed to access profile. Please try again.");
      console.error("Error accessing profile:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const handleViewAllComments = (post) => {
    setSelectedPost(post);
  };

  const closeCommentsModal = () => {
    setSelectedPost(null);
  };

  const handlePublishPost = async (postId) => {
    try {
      setError(null);
      await axios.patch(
        `${BASE_URL}/api/posts/${postId}/publish`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Refresh posts after publishing
      fetchPosts(currentPage);
    } catch (error) {
      setError("Failed to publish post. Please try again.");
      console.error("Error publishing post:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/posts/${postId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleProfileRedirect}
                className="px-6 py-3 bg-white text-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2 font-semibold"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Your Profile</span>
              </button>
              <a
                href="/create-post"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2 font-semibold"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Create Post</span>
              </a>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2 font-semibold"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Logout</span>
            </button>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <h1 className="text-4xl font-bold text-gray-800 mb-8">Blog Posts</h1>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {post.imageUrl && (
                    <div className="relative h-48">
                      <img
                        src={`${BASE_URL}${post.imageUrl}`}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                      {post.authorId ===
                        parseInt(localStorage.getItem("userId")) && (
                        <div className="absolute top-4 right-4 group">
                          <div className="relative">
                            <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-blue-500"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <div className="absolute right-0 mt-2 w-24 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                              Your Post
                              <div className="absolute -top-1 right-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-blue-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {post.author?.email}
                        </p>
                      </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-3 line-clamp-2">
                      {post.title}
                    </h2>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.content}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <time className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleLike(post.id)}
                          className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{post._count?.likes || 0}</span>
                        </button>
                        <span>•</span>
                        <span>{post._count?.comments || 0} comments</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {!post.published &&
                          post.authorId ===
                            parseInt(localStorage.getItem("userId")) && (
                            <button
                              onClick={() => handlePublishPost(post.id)}
                              className="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all"
                            >
                              Publish
                            </button>
                          )}
                        <button
                          onClick={() => handlePostClick(post.id)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
                        >
                          Read More
                        </button>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={commentText[post.id] || ""}
                            onChange={(e) =>
                              handleCommentChange(post.id, e.target.value)
                            }
                            placeholder="Add a comment..."
                            className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
                          />
                          <button
                            onClick={() => handleComment(post.id)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
                          >
                            Post
                          </button>
                        </div>

                        {post.comments && post.comments.length > 0 && (
                          <div className="mt-4 space-y-3">
                            {post.comments.slice(0, 2).map((comment) => (
                              <div
                                key={comment.id}
                                className="bg-gray-50 rounded-lg p-3"
                              >
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-semibold text-gray-800 text-sm">
                                    {comment.author?.email}
                                  </span>
                                  <time className="text-gray-500 text-xs">
                                    {new Date(
                                      comment.createdAt
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </time>
                                </div>
                                <p className="text-gray-600 text-sm">
                                  {comment.content}
                                </p>
                              </div>
                            ))}
                            {post.comments.length > 2 && (
                              <button
                                onClick={() => handleViewAllComments(post)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors"
                              >
                                View all {post.comments.length} comments
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center bg-white rounded-xl shadow-lg p-8">
              <p className="text-xl text-gray-600 mb-4">No posts available.</p>
              <a
                href="/create-post"
                className="inline-block px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all"
              >
                Create Your First Post
              </a>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-6 py-3 bg-white text-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Previous</span>
            </button>
            <span className="text-lg font-semibold text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-6 py-3 bg-white text-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Comments Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Comments</h3>
                <button
                  onClick={closeCommentsModal}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                {selectedPost.comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-blue-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
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
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
