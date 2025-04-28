import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

const SinglePost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [loading, setLoading] = useState(false);
   const { token,logout,authData } = useAuth();
   
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const fetchPost = async () => {
    try {
      const response = await api.get(`/posts/${id}`);
      setPost(response.data);
    } catch (error) {
      console.error("Failed to fetch post:", error);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const destroy = async (id) => {
    if (window.confirm("Are you sure you want to delete this Comment?")) {
      try {
        const response = await api.delete(`/comments/${id}`)
        alert(response.data.message || "Comments deleted successfully")
        fetchPost()
      } catch (error) {
        console.error("Delete failed", error)
        alert("Delete failed: " + (error.response?.data?.message || "Unknown error"))
      }
    }
  }

  const submitComment = async () => {
    if (!commentContent.trim()) return;

    try {
      setLoading(true);
      await api.post(`/comments`, {
        content: commentContent,
        post_id: post.id,
      });
      setCommentContent("");
      setShowModal(false);
      fetchPost(); // reload comments after posting
    } catch (error) {
      console.error("Failed to submit comment:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!post)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="loader animate-spin h-10 w-10 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
    
    const hasPermission = (permissionName) => {
      if (!authData || !authData.permissions) return false;
      return authData.permissions.includes(permissionName);
    };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Post Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        {post.image && (
          <img
            src={`${backendUrl}/${post.image}`}
            alt={post.title}
            className="w-full h-64 object-cover"
          />
        )}
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{post.title}</h1>
          <p className="text-gray-600 mb-6">{post.content}</p>

          {/* Author */}
          <div className="flex items-center text-sm text-gray-500">
            <span>By: {post.user?.name || "Unknown"}</span>
            <span className="mx-2">•</span>
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-gray-100 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Comments ({post?.comments?.length})</h2>
          {token ? (
            <>
              {hasPermission('comment on posts') && (
              <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add Comment
            </button>
              )}
            </>
          ):(
            <div>please login fisrt for comment</div>

          )}
          
        </div>

        {post?.comments?.length === 0 ? (
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        ) : (
          <ul className="space-y-4">
            {post?.comments?.map((comment) => (
              <li key={comment.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-800">
                    {comment.user?.name || "Anonymous"}
                    {hasPermission('manage comments') && (
                    <button  onClick={() => destroy(comment.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"> Delete</button>
                    )}
                    </span>
                  <span className="text-gray-400 text-sm">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Comment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Add a Comment</h3>
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              rows="4"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="Write your comment..."
            ></textarea>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={submitComment}
                disabled={loading}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SinglePost;
