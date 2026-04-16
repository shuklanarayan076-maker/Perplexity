import { createBrowserRouter, Link } from "react-router";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import Dashboard from "../features/chat/pages/Dashboard";
import Protected from "../features/auth/components/Protected";
import { Navigate } from "react-router";
export const router = createBrowserRouter([
{
        path: "/",
        element: <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-slate-900 to-black">
          <Protected>
             <Dashboard/>
          </Protected>
        </div>
    },
    {
      path : "/dashboard",
      element: <Navigate to="/" replace/>
    },
    {
        path: "/login",
        element:<Login/>
    },
    {
        path:"/register",
        element:<Register/>
    }
])