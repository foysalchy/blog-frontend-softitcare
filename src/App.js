import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Login from "./components/Auth/Login"
import Register from "./components/Auth/Register"
import CategoryManage from "./components/category/CategoryManage"
import PostList from "./components/Posts/PostList"
import UserManage from "./components/users/UserManage"
import Home from "./components/Home"
import SinglePost from "./components/Posts/SinglePost"
import { AuthProvider } from "./context/AuthContext"
import Navbar from "./components/Navbar"
import ProtectedRoute from "./components/ProtectedRoute"
import NotFound from "./components/NotFound"

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Navbar />

          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />} />
            <Route path="/post/:id" element={<SinglePost />} />

            <Route
              path="/category"
              element={<ProtectedRoute element={<CategoryManage />} requiredPermission="manage categories" />}
            />

            <Route
              path="/manage-posts"
              element={
                <ProtectedRoute
                  element={<PostList />}
                  requiredPermissions={["manage posts", "create posts", "moderate comments"]}
                />
              }
            />

            <Route
              path="/manage-users"
              element={<ProtectedRoute element={<UserManage />} requiredPermissions={["manage users"]} />}
            />

            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
