"use client"

import { useEffect, useState } from "react"
import api from "../../api"


// Modal component for both Edit and Add operations
const UserModal = ({ isOpen, onClose, user, onSave, title, roles }) => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [roleId, setRoleId] = useState("")
  const [errors, setErrors] = useState({})

  // Initialize form when modal opens or user changes
  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setEmail(user.email || "")
      setPassword("") // Don't populate password for security
      setRoleId(user.roles && user.roles[0] ? user.roles[0].name.toString() : "")
    } else {
      setName("")
      setEmail("")
      setPassword("")
      setRoleId(roles && roles.length > 0 ? roles[0].name.toString() : "")
    }
    setErrors({})
  }, [user, isOpen, roles])

  const validate = () => {
    const newErrors = {}
    if (!name.trim()) newErrors.name = "Name is required"
    if (!email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid"

    // Only require password for new users
    if (!user && !password) newErrors.password = "Password is required"
    if (!roleId) newErrors.roleId = "Role is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const userData = {
      ...user,
      name,
      email,
      role_id: roleId,
    }

    // Only include password if it's provided (for edit) or required (for new user)
    if (password) {
      userData.password = password
    }

    onSave(userData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-900 hover:text-gray-700 text-xl font-bold">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`shadow appearance-none border ${
                errors.name ? "border-red-500" : ""
              } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            />
            {errors.name && <p className="text-red-500 text-xs italic mt-1">{errors.name}</p>}
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`shadow appearance-none border ${
                errors.email ? "border-red-500" : ""
              } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            />
            {errors.email && <p className="text-red-500 text-xs italic mt-1">{errors.email}</p>}
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password {user ? "(Leave blank to keep current)" : ""}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`shadow appearance-none border ${
                errors.password ? "border-red-500" : ""
              } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            />
            {errors.password && <p className="text-red-500 text-xs italic mt-1">{errors.password}</p>}
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className={`shadow appearance-none border ${
                errors.roleId ? "border-red-500" : ""
              } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            >
              <option value="">Select a role</option>
              {roles &&
                roles.map((role) => (
                  <option key={role.name} value={role.name}>
                    {role.name}
                  </option>
                ))}
            </select>
            {errors.roleId && <p className="text-red-500 text-xs italic mt-1">{errors.roleId}</p>}
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

const UserManage = () => {
  const [data, setDatas] = useState([])
  const [roles, setRoles] = useState([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await api.get("/users")
      setDatas(response.data)
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await api.get("/users/roles")
      setRoles(response.data)
    } catch (error) {
      console.error("Failed to fetch roles:", error)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  // Delete user
  const destroy = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await api.delete(`/users/${id}`)
        alert(response.data.message || "User deleted successfully")
        fetchUsers()
      } catch (error) {
        console.error("Delete failed", error)
        alert("Delete failed: " + (error.response?.data?.message || "Unknown error"))
      }
    }
  }

  // Open edit modal with user data
  const handleEdit = (user) => {
    setCurrentUser(user)
    setIsEditModalOpen(true)
  }

  // Open add modal
  const handleAdd = () => {
    setCurrentUser(null)
    setIsAddModalOpen(true)
  }

  // Save edited user
  const handleSaveEdit = async (updatedUser) => {
    try {
      const userData = {
        name: updatedUser.name,
        email: updatedUser.email,
        role_id: updatedUser.role_id,
      }

      // Only include password if it's provided
      if (updatedUser.password) {
        userData.password = updatedUser.password
      }

      const response = await api.put(`/users/${updatedUser.id}`, userData)
      alert("User updated successfully")
      fetchUsers()
    } catch (error) {
      console.error("Update failed", error)
      alert("Update failed: " + (error.response?.data?.message || "Unknown error"))
    }
  }

  // Save new user
  const handleSaveNew = async (newUser) => {
    try {
      const userData = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role_id: newUser.role_id,
      }

      const response = await api.post("/users", userData)
      alert("User created successfully")
      fetchUsers()
    } catch (error) {
      console.error("Create failed", error)
      alert("Create failed: " + (error.response?.data?.message || "Unknown error"))
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">User Management</h2>
        <button onClick={handleAdd} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Add New User
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          <p className="mt-2">Loading users...</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left border-b">SL</th>
                <th className="py-3 px-6 text-left border-b">Name</th>
                <th className="py-3 px-6 text-left border-b">Email</th>
                <th className="py-3 px-6 text-left border-b">Role</th>
                <th className="py-3 px-6 text-left border-b">Created At</th>
                <th className="py-3 px-6 text-center border-b">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {data.length > 0 ? (
                data.map((item, key) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-6 text-left">{key + 1}</td>
                    <td className="py-3 px-6 text-left">{item.name}</td>
                    <td className="py-3 px-6 text-left">{item.email}</td>
                    <td className="py-3 px-6 text-left">
                      {item.roles && item.roles.length > 0 ? item.roles[0].name : "No role"}
                    </td>
                    <td className="py-3 px-6 text-left">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex item-center justify-center">
                        <button
                          onClick={() => handleEdit(item)}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => destroy(item.id)}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-6">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      <UserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={currentUser}
        onSave={handleSaveEdit}
        title="Edit User"
        roles={roles}
      />

      {/* Add Modal */}
      <UserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        user={null}
        onSave={handleSaveNew}
        title="Add New User"
        roles={roles}
      />
    </div>
  )
}

export default UserManage
