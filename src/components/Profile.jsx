import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("published");
  const [posts, setPosts] = useState({ published: [], unpublished: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  console.log("Profile Component Mounted");
  console.log("Current token:", token);

  useEffect(() => {
    console.log("useEffect triggered");
    if (!token) {
      console.log("No token found, redirecting to login");
      navigate("/login");
      return;
    }
    fetchUserPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  const fetchUserPosts = async () => {
    console.log("Fetching user posts...");
    try {
      setLoading(true);
      setError(null);
      console.log(
        "Making API request to:",
        "http://localhost:8080/api/posts/user/posts"
      );
      const response = await axios.get(
        "http://localhost:8080/api/posts/user/posts",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API Response:", response);
      console.log("All posts from API:", response.data);

      // The API now returns posts already separated into published and unpublished
      setPosts(response.data);
    } catch (err) {
      console.error("Error fetching user posts:", err);
      setError("Failed to fetch your posts. Please try again later.");
      if (err.response?.status === 401) {
        console.log("Unauthorized access, logging out");
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const handlePublishPost = async (postId) => {
    try {
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
      fetchUserPosts();
    } catch (error) {
      console.error("Error publishing post:", error);
      setError("Failed to publish post. Please try again.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await axios.delete(`http://localhost:8080/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Refresh posts after deletion
      fetchUserPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      setError("Failed to delete post. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Posts</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab("published")}
          className={`px-4 py-2 ${
            activeTab === "published"
              ? "border-b-2 border-blue-500 text-blue-600 font-semibold"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Published Posts ({posts.published.length})
        </button>
        <button
          onClick={() => setActiveTab("unpublished")}
          className={`px-4 py-2 ${
            activeTab === "unpublished"
              ? "border-b-2 border-blue-500 text-blue-600 font-semibold"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Draft Posts ({posts.unpublished.length})
        </button>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(activeTab === "published" ? posts.published : posts.unpublished).map(
          (post) => (
            <div
              key={post.id}
              className="post p-6 border rounded-lg shadow-lg relative bg-white"
            >
              {!post.published && (
                <div className="absolute top-2 right-2">
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Draft
                  </span>
                </div>
              )}
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  {post.title}
                </h2>
                <span className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              {post.imageUrl && (
                <img
                  src={`http://localhost:8080${post.imageUrl}`}
                  alt={post.title}
                  className="w-full h-48 object-cover mb-4 rounded"
                />
              )}
              <p className="text-gray-700 mb-4">
                {post.content.substring(0, 100)}...
              </p>

              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  {!post.published && (
                    <button
                      onClick={() => handlePublishPost(post.id)}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Publish
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  {post._count?.likes || 0} likes • {post._count?.comments || 0}{" "}
                  comments
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Empty State */}
      {(activeTab === "published" ? posts.published : posts.unpublished)
        .length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <p className="mb-4">
            No {activeTab === "published" ? "published" : "draft"} posts yet.
          </p>
          <button
            onClick={() => navigate("/create-post")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create New Post
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Post Statistics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white rounded shadow">
            <div className="text-2xl font-bold text-blue-600">
              {posts.published.length}
            </div>
            <div className="text-sm text-gray-600">Published Posts</div>
          </div>
          <div className="text-center p-3 bg-white rounded shadow">
            <div className="text-2xl font-bold text-yellow-600">
              {posts.unpublished.length}
            </div>
            <div className="text-sm text-gray-600">Draft Posts</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
