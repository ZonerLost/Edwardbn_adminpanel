import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";
import Users from "./pages/Users";
import Faqs from "./pages/Faqs";
import UserFeedBack from "./pages/UserFeedBack";
import Appsettings from "./pages/appSettings";
import Login from "./pages/Login";
import Contract from "./pages/Contract";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import NoAccess from "./pages/NoAccess";
import ProtectedRoute from "./auth/ProtectedRoute";

const router = createBrowserRouter([
  // Public
  { path: "/login", element: <Login /> },

  // Authenticated shell
  {
    element: <ProtectedRoute allowStaff={true} />, // allow staff/admin to sign in
    children: [
      {
        path: "/",
        element: <RootLayout />,
        children: [
          // Set per-route permissions (admins bypass)
          { element: <ProtectedRoute requirePerm="view_reports" />, children: [
            { index: true, element: <Home /> },
          ] },

          { element: <ProtectedRoute requirePerm="manage_users" />, children: [
            { path: "users", element: <Users /> },
          ] },

          { element: <ProtectedRoute requirePerm="manage_contracts" />, children: [
            { path: "contract", element: <Contract /> },
          ] },

          { element: <ProtectedRoute requirePerm="manage_faqs" />, children: [
            { path: "content", element: <Appsettings /> },
            { path: "faqs", element: <Faqs /> },
          ] },

          // Reports/feedback example permission
          { element: <ProtectedRoute requirePerm="view_reports" />, children: [
            { path: "user-feedback", element: <UserFeedBack /> },
          ] },

          // Profile is accessible to any signed-in user
          { path: "profile", element: <Profile /> },

          // No access + 404
          { path: "no-access", element: <NoAccess /> },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}




