"use client"

import { useEffect, useState } from "react"
import api from "../../api"

// Modal component for both Edit and Add operations
const CategoryModal = ({ isOpen, onClose, category, onSave, title }) => {
  const [name, setName] = useState("")

  // Initialize form when modal opens or category changes
  useEffect(() => {
    if (category) {
      setName(category.name)
    } else {
      setName("")
    }
  }, [category, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...category, name })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="text-white-900 hover:text-gray-700">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const CategoryManage = () => {
  const [data, setDatas] = useState([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState(null)

  const fetchPosts = async () => {
    try {
      const response = await api.get("/categories")
      setDatas(response.data)
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  // Delete category
  const destroy = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const response = await api.delete(`/categories/${id}`)
        alert(response.data.message)
        fetchPosts()
      } catch (error) {
        console.error("Delete failed", error)
        alert("Delete failed.")
      }
    }
  }

  // Open edit modal with category data
  const handleEdit = (category) => {
    setCurrentCategory(category)
    setIsEditModalOpen(true)
  }

  // Open add modal
  const handleAdd = () => {
    setCurrentCategory(null)
    setIsAddModalOpen(true)
  }

  // Save edited category
  const handleSaveEdit = async (updatedCategory) => {
    try {
      const response = await api.put(`/categories/${updatedCategory.id}`, {
        name: updatedCategory.name,
      })
      alert("Category updated successfully")
      fetchPosts()
    } catch (error) {
      console.error("Update failed", error)
      alert("Update failed.")
    }
  }

  // Save new category
  const handleSaveNew = async (newCategory) => {
    try {
      const response = await api.post("/categories", {
        name: newCategory.name,
      })
      alert("Category created successfully")
      fetchPosts()
    } catch (error) {
      console.error("Create failed", error)
      alert("Create failed.")
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Category List</h2>
        <button onClick={handleAdd} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Add New Category
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
              <th className="py-3 px-6 border-b">SL</th>
              <th className="py-3 px-6 border-b">ID</th>
              <th className="py-3 px-6 border-b">Name</th>
              <th className="py-3 px-6 border-b">Created At</th>
              <th className="py-3 px-6 border-b">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {data.length > 0 ? (
              data.map((item, key) => (
                <tr key={item.id} className="border-b hover:bg-gray-100">
                  <td className="py-3 px-6 text-center">{key + 1}</td>
                  <td className="py-3 px-6 text-center">{item.id}</td>
                  <td className="py-3 px-6 text-center">{item.name}</td>
                  <td className="py-3 px-6 text-center">{new Date(item.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-6 text-center">
                    <button className="text-white-500 hover:text-white-700 mr-2" onClick={() => handleEdit(item)}>
                      Edit
                    </button>
                    <button className="text-white-500 bg-red-500 hover:bg-red-800  " onClick={() => destroy(item.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-6">
                  No Categories Found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <CategoryModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        category={currentCategory}
        onSave={handleSaveEdit}
        title="Edit Category"
      />

      {/* Add Modal */}
      <CategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        category={null}
        onSave={handleSaveNew}
        title="Add New Category"
      />
    </div>
  )
}

export default CategoryManage
