import axios from "axios";
import { useState } from "react";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleImageChange = (e) => {
    setImage(e.target.files[0]); // Store selected image file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!token) {
      setError("Authentication failed. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("isPublished", isPublished);
      if (image) formData.append("image", image); // Append image if selected

      await axios.post("http://localhost:8080/api/posts", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Post created successfully!");
      setTitle("");
      setContent("");
      setImage(null);
      setIsPublished(false);
    } catch (error) {
      setError("Failed to create post. Please try again." + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Create Post</h1>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="image">Upload Image</label>
          <input type="file" id="image" accept="image/*" onChange={handleImageChange} />
        </div>
        <div className="form-group">
          <label htmlFor="isPublished">Is Published</label>
          <input
            type="checkbox"
            id="isPublished"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Post"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
