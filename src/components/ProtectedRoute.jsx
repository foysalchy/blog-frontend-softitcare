"use client"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import NotFound from "./NotFound"

const ProtectedRoute = ({ element, requiredPermission, requiredPermissions }) => {
  const { token, authData } = useAuth()
  const location = useLocation()

  

  // Permission check function
  const hasPermission = (permissionName) => {
    if (!authData || !authData.permissions) return false
    return authData.permissions.includes(permissionName)
  }

  // Check if user has at least one of the required permissions
  const hasAnyPermission = (permissions) => {
    if (!permissions || permissions.length === 0) return true
    return permissions.some((permission) => hasPermission(permission))
  }

  // Handle both single permission and multiple permissions
  const permissionsToCheck = requiredPermissions || (requiredPermission ? [requiredPermission] : [])

  // If permissions are required, check if user has any of them
  if (permissionsToCheck.length > 0 && !hasAnyPermission(permissionsToCheck)) {
    // Show 404 page if user doesn't have any of the required permissions
    return <NotFound />
  }

  // If authenticated and has permission (or no specific permission required), render the component
  return element
}

export default ProtectedRoute
