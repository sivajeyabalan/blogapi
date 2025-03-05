import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [posts, setPost] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
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
        `http://localhost:8080/api/posts/paginated?page=${page}&limit=5`,
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
        `http://localhost:8080/api/posts/${postId}/comment`,
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
        `http://localhost:8080/api/posts/${postId}/like`,
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
      const response = await axios.get("http://localhost:8080/api/profile", {
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
        `http://localhost:8080/api/posts/${postId}/publish`,
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

  const closeFullPostModal = () => {
    setFullPost(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handleProfileRedirect}
          className="text-primary hover:underline"
        >
          Go to Profile
        </button>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {posts ? (
        <h1 className="text-3xl font-bold text-primary mb-4">Blog Posts</h1>
      ) : (
        <p>Loading...</p>
      )}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="post p-6 border rounded-lg shadow-lg relative bg-white cursor-pointer"
              onClick={() => handlePostClick(post.id)}
            >
              {(() => {
                console.log("Checking authorId for icon:", post.authorId);
                console.log("Current userId:", localStorage.getItem("userId"));
                return (
                  post.authorId === parseInt(localStorage.getItem("userId"))
                );
              })() && (
                <div className="absolute top-2 right-2 group cursor-pointer">
                  <div className="relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-green-600 hover:text-green-800"
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
                    <div className="absolute right-0 mt-2 w-24 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      Your Post
                      <div className="absolute -top-1 right-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {post.title}
                  </h2>
                </div>
                <div className="flex items-center space-x-2">
                  {!post.published &&
                    post.authorId ===
                      parseInt(localStorage.getItem("userId")) && (
                      <button
                        onClick={() => handlePublishPost(post.id)}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        Publish
                      </button>
                    )}
                  <span className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Posted by: {post.author?.email}
              </div>
              {post.imageUrl && (
                <>
                  <img
                    src={`http://localhost:8080${post.imageUrl}`}
                    alt={post.title}
                    className="w-full h-48 object-cover mb-4 rounded"
                  />
                </>
              )}
              <p className="text-gray-700 mb-4">
                {post.content.substring(0, 100)}...
              </p>

              {/* Likes Section */}
              <div className="flex items-center space-x-2 mb-3">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center space-x-1 ${
                    post.likes?.includes(localStorage.getItem("userId"))
                      ? "text-red-500"
                      : "text-gray-600 hover:text-blue-500"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill={
                      post.likes?.includes(localStorage.getItem("userId"))
                        ? "currentColor"
                        : "none"
                    }
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span>{post.likes?.length || 0} Likes</span>
                </button>
              </div>

              {/* Comments Section */}
              <div className="border-t pt-3">
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={commentText[post.id] || ""}
                    onChange={(e) =>
                      handleCommentChange(post.id, e.target.value)
                    }
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-1 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleComment(post.id)}
                    className="px-4 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Post
                  </button>
                </div>

                {post.comments && post.comments.length > 0 && (
                  <>
                    <h3 className="text-sm font-semibold mb-2">
                      Recent Comments
                    </h3>
                    <div className="space-y-3">
                      {post.comments.slice(0, 2).map((comment) => (
                        <div key={comment.id} className="text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-800">
                              {comment.author?.email}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {new Date(comment.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1">
                            {comment.content}
                          </p>
                        </div>
                      ))}
                      {post.comments.length > 2 && (
                        <button
                          onClick={() => handleViewAllComments(post)}
                          className="text-sm text-blue-500 hover:underline cursor-pointer"
                        >
                          View all {post.comments.length} comments
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No posts available.</p>
      )}
      <p className="mt-6">
        <a href="/create-post" className="text-black hover:underline">
          Create Post
        </a>
        <br />
      </p>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-primary text-black rounded hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light"
        >
          Previous
        </button>
        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-primary text-black rounded hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light"
        >
          Next
        </button>
      </div>

      {/* Full Post Modal */}
      {fullPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{fullPost.title}</h3>
                <button
                  onClick={closeFullPostModal}
                  className="text-gray-500 hover:text-gray-700"
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
              <p className="text-gray-700 mb-4">{fullPost.content}</p>
              {fullPost.imageUrl && (
                <img
                  src={`http://localhost:8080${fullPost.imageUrl}`}
                  alt={fullPost.title}
                  className="w-full h-48 object-cover mb-4 rounded"
                />
              )}
              <div className="text-sm text-gray-600 mb-2">
                Posted by: {fullPost.author?.email}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {new Date(fullPost.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div className="border-t pt-3">
                <h3 className="text-sm font-semibold mb-2">Comments</h3>
                {fullPost.comments && fullPost.comments.length > 0 ? (
                  <div className="space-y-3">
                    {fullPost.comments.map((comment) => (
                      <div key={comment.id} className="text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-800">
                            {comment.author?.email}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {new Date(comment.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
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
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">All Comments</h3>
                <button
                  onClick={closeCommentsModal}
                  className="text-gray-500 hover:text-gray-700"
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
                  <div key={comment.id} className="border-b pb-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-800">
                        {comment.author?.email}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {new Date(comment.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{comment.content}</p>
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
