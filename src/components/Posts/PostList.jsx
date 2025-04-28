"use client"

import { useEffect, useState } from "react"
import api from "../../api"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

// Modal component for both Edit and Add operations
const PostModal = ({ isOpen, onClose, blog, onSave, title }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  
    categories: [],
    image: null,
    status: "draft",
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch categories for the dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories")
        setCategories(response.data)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      }
    }

    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  // Initialize form when modal opens or blog changes
  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || "",
        content: blog.content || "",
       
        categories: blog.categories?.map((cat) => cat.id) || [],
        image: null,
        status: blog.status || "draft",
      })

      if (blog.image_url) {
        setImagePreview(blog.image_url)
      } else {
        setImagePreview(null)
      }
    } else {
      setFormData({
        title: "",
        content: "",
     
        categories: [],
        image: null,
        status: "draft",
      })
      setImagePreview(null)
    }
  }, [blog, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCategoryChange = (e) => {
    const value = Array.from(e.target.selectedOptions, (option) => option.value)
    setFormData((prev) => ({
      ...prev,
      categories: value,
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }))

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create FormData object for file upload
      const postData = new FormData()
      postData.append("title", formData.title)
      postData.append("content", formData.content)
      postData.append("status", formData.status)

      // Append each category ID
      formData.categories.forEach((categoryId) => {
        postData.append("categories[]", categoryId)
      })

      // Only append image if a new one is selected
      if (formData.image) {
        postData.append("image", formData.image)
      }
      console.log(postData,formData.image)
      await onSave(postData)
      onClose()
    } catch (error) {
      console.error("Form submission failed", error)
      alert("Failed to save post.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl my-8 mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-900 hover:text-gray-700 text-2xl">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">Blog Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Categories</label>
              <select
                name="categories"
                multiple
                value={formData.categories}
                onChange={handleCategoryChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple categories</p>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">Featured Image</label>
              <input
                type="file"
                name="image"
                onChange={handleImageChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                accept="image/*"
              />

              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="h-32 object-cover rounded border"
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">content</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={6}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const PostList = () => {
  const [data, setDatas] = useState([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [currentPost, setCurrentPost] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const response = await api.get("/posts")
      setDatas(response.data)
    } catch (error) {
      console.error("Failed to fetch posts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  // Delete blog
  const destroy = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const response = await api.delete(`/posts/${id}`)
        alert(response.data.message)
        fetchPosts()
      } catch (error) {
        console.error("Delete failed", error)
        alert("Delete failed.")
      }
    }
  }

  // Open edit modal with blog data
  const handleEdit = (post) => {
    setCurrentPost(post)
    setIsEditModalOpen(true)
  }

  // Open add modal
  const handleAdd = () => {
    setCurrentPost(null)
    setIsAddModalOpen(true)
  }

  // Save edited blog
  const handleSaveEdit = async (formData) => {
    formData.append("post_id", currentPost.id)
    try {
      const response = await api.post(`/posts/update`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      alert("Post updated successfully")
      fetchPosts()
      return response
    } catch (error) {
      console.error("Update failed", error)
      alert("Update failed.")
      throw error
    }
  }

  // Save new blog
  const handleSaveNew = async (formData) => {
    try {
      const response = await api.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      alert("Blog created successfully")
      fetchPosts()
      return response
    } catch (error) {
      console.error("Create failed", error)
      alert("Create failed.")
      throw error
    }
  }

  // Format categories for display
  const formatCategories = (categories) => {
    if (!categories || categories.length === 0) return "None"
    return categories.map((cat) => cat.name).join(", ")
  }
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  console.log(process.env)

  const { authData } = useAuth();
    
    // Permission check function
    const hasPermission = (permissionName) => {
      if (!authData || !authData.permissions) return false;
      return authData.permissions.includes(permissionName);
    };
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Blogs List</h2>
        {hasPermission('create posts') && (
        <button onClick={handleAdd} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Add New Blog
        </button>
         )}
      </div>
       

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          <p className="mt-2">Loading posts...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
                <th className="py-3 px-6 border-b">SL</th>
                <th className="py-3 px-6 border-b">Title</th>
                <th className="py-3 px-6 border-b">Categories</th>
                <th className="py-3 px-6 border-b">Status</th>
                <th className="py-3 px-6 border-b">Image</th>
                <th className="py-3 px-6 border-b">Created At</th>
                <th className="py-3 px-6 border-b">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {data.length > 0 ? (
                data.map((item, key) => (
                  <tr key={item.id} className="border-b hover:bg-gray-100">
                    <td className="py-3 px-6 text-center">{key + 1}</td>
                    <td className="py-3 px-6">{item.title}</td>
                    <td className="py-3 px-6">{formatCategories(item.categories)}</td>
                    <td className="py-3 px-6 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          item.status === "published"
                            ? "bg-green-200 text-green-800"
                            : item.status === "draft"
                              ? "bg-yellow-200 text-yellow-800"
                              : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      {item.image ? (
                        <img
                          src={`${backendUrl}/${item.image}` || "/placeholder.svg"}
                       
                          className="h-10 w-10 object-cover rounded inline-block"
                        />
                      ) : (
                        <span className="text-gray-400">No image</span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-center">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-6 text-center">
                       <Link to={`/post/${item.id}`} className="bg-green-500 text-white px-2 py-1 rounded mr-2 text-xs hover:bg-green-700">
                       View
                       </Link>
                       {hasPermission('manage posts') && (
                          <>
                            <button
                              className="bg-blue-500 text-white px-2 py-1 rounded mr-2 text-xs hover:bg-blue-700"
                              onClick={() => handleEdit(item)}
                            >
                              Edit
                            </button>
                            <button
                              className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                              onClick={() => destroy(item.id)}
                            >
                              Delete
                            </button>
                          </>
                       )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-6">
                    No Blog Posts Found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      <PostModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        blog={currentPost}
        onSave={handleSaveEdit}
        title="Edit Blog Post"
      />

      {/* Add Modal */}
      <PostModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        blog={null}
        onSave={handleSaveNew}
        title="Add New Blog Post"
      />
    </div>
  )
}

export default PostList
