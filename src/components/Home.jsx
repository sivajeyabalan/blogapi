import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Home.css"; // Import your plain CSS

const Home = () => {
  const [posts, setPost] = useState([]);

  useEffect(() => {
    axios
      .get("/api/posts")
      .then((res) => setPost(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="container">
      {posts ? <h1 className="title">Blog Posts</h1> : <p>Loading...</p>}

      {posts.length > 0 ? (
        <div className="postsWrapper">
          {posts.map((post) => (
            <div key={post.id} className="post">
              <h2 className="postTitle">{post.title}</h2>
              <p>{post.content.substring(0, 100)}...</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No posts available.</p>
      )}
    </div>
  );
};

export default Home;
