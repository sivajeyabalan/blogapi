import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("published");
  const [posts, setPosts] = useState({ published: [], unpublished: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editPost, setEditPost] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  console.log("Profile Component Mounted");
  console.log("Current token:", token);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Current token:", token);
    if (!token) {
      console.log("No token found, redirecting to login");
      navigate("/login");
      return;
    }
    fetchUserProfile();
    fetchUserPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/users/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserProfile(response.data);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  };

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

  const handleUpdatePost = async (
    postId,
    updatedContent,
    updatedTitle,
    isPublished
  ) => {
    if (!postId || !updatedContent.trim() || !updatedTitle.trim()) {
      setError("Post title and content cannot be empty.");
      return;
    }

    try {
      const token = localStorage.getItem("token"); // Retrieve token here
      if (!token) {
        setError("Unauthorized: No token found.");
        return;
      }

      await axios.put(
        `http://localhost:8080/api/posts/${postId}`,
        {
          title: updatedTitle,
          content: updatedContent,
          published: isPublished,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      fetchUserPosts(); // Refresh posts after updating
      setEditPost(null);
    } catch (error) {
      console.error(
        "Error updating post:",
        error.response?.data || error.message
      );
      setError(
        error.response?.data?.message ||
          "Failed to update post. Please try again."
      );
      if (error.response?.status === 401) {
        handleLogout(); // Log out if unauthorized
      }
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleUpdateComment = async (commentId, updatedContent) => {
    if (!commentId || !updatedContent.trim()) {
      setError("Comment content cannot be empty.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:8080/api/comments/${commentId}`,
        { content: updatedContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchUserPosts(); // Refresh posts after updating
      // eslint-disable-next-line no-undef
      setEditComment(null);
    } catch (error) {
      console.error("Error updating comment:", error);
      setError("Failed to update comment. Please try again.");
      if (error.response?.status === 401) {
        handleLogout(); // Log out if unauthorized
      }
    }
  };

  const handlePostClick = (postId) => {
    // Implement the logic to navigate to the full post details
    console.log(`Navigating to full post details for post ID: ${postId}`);
    // You can use navigate from react-router-dom to navigate to the full post details page
    navigate(`/post/${postId}`);
  };

  console.log("Token being used:", token);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Your Profile
              </h1>
              {userProfile && (
                <div className="space-y-2">
                  <p className="text-xl text-gray-600">
                    <span className="font-semibold">Email:</span>{" "}
                    {userProfile.email}
                  </p>
                  <p className="text-xl text-gray-600">
                    <span className="font-semibold">Profession:</span>{" "}
                    {userProfile.profession || "Not specified"}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-500 text-white text-lg font-semibold rounded-lg hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-300 transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="flex space-x-1 p-1 bg-gray-100">
            <button
              onClick={() => setActiveTab("published")}
              className={`flex-1 py-4 text-lg font-semibold rounded-lg transition-all ${
                activeTab === "published"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Published Posts ({posts.published.length})
            </button>
            <button
              onClick={() => setActiveTab("unpublished")}
              className={`flex-1 py-4 text-lg font-semibold rounded-lg transition-all ${
                activeTab === "unpublished"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Draft Posts ({posts.unpublished.length})
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(activeTab === "published"
            ? posts.published
            : posts.unpublished
          ).map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {post.imageUrl && (
                <div className="relative h-48">
                  <img
                    src={`http://localhost:8080${post.imageUrl}`}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  {!post.published && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                        Draft
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-3 line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.content}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{post._count?.likes || 0} likes</span>
                    <span>•</span>
                    <span>{post._count?.comments || 0} comments</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!post.published && (
                    <button
                      onClick={() => handlePublishPost(post.id)}
                      className="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    >
                      Publish
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setEditPost(post)}
                    className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handlePostClick(post.id)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                  >
                    View Full Post
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {(activeTab === "published" ? posts.published : posts.unpublished)
          .length === 0 && (
          <div className="text-center bg-white rounded-xl shadow-lg p-8">
            <p className="text-xl text-gray-600 mb-4">
              No {activeTab === "published" ? "published" : "draft"} posts yet.
            </p>
            <button
              onClick={() => navigate("/create-post")}
              className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all"
            >
              Create New Post
            </button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Post Statistics
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="text-3xl font-bold text-blue-600">
                {posts.published.length}
              </div>
              <div className="text-lg text-gray-600">Published Posts</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-6">
              <div className="text-3xl font-bold text-yellow-600">
                {posts.unpublished.length}
              </div>
              <div className="text-lg text-gray-600">Draft Posts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Post Modal */}
      {editPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Edit Post
              </h3>
              <textarea
                value={editPost.content}
                onChange={(e) =>
                  setEditPost({ ...editPost, content: e.target.value })
                }
                className="w-full h-40 p-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
              <div className="flex justify-end mt-6 space-x-4">
                <button
                  onClick={() =>
                    handleUpdatePost(
                      editPost.id,
                      editPost.content,
                      editPost.title,
                      editPost.published
                    )
                  }
                  className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all"
                >
                  Update
                </button>
                <button
                  onClick={() => setEditPost(null)}
                  className="px-6 py-3 bg-gray-500 text-white text-lg font-semibold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
