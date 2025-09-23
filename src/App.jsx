// import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import RootLayout from "./layouts/RootLayout";
// import Home from "./pages/Home";
// import Users from "./pages/Users";
// import Faqs from "./pages/Faqs";
// import UserFeedBack from "./pages/UserFeedBack";
// import Appsettings from "./pages/appSettings";
// import Login from "./pages/Login";
// import Contract from "./pages/Contract";
// import Profile from "./pages/Profile";
// import NotFound from "./pages/NotFound";

// import ProtectedRoute from "./auth/ProtectedRoute";

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <RootLayout />,
//     children: [
//       { index: true, element: <Home /> },
//       { path: "users", element: <Users /> },
//       { path: "contract", element: <Contract /> },
//       { path: "content", element: <Appsettings /> },
//       { path: "faqs", element: <Faqs /> },
//       { path: "user-feedback", element: <UserFeedBack /> },
//       { path: "profile", element: <Profile /> },
//       { path: "*", element: <NotFound /> },

//       // (Add these if they exist and should be protected:)
//       // { path: "jobs", element: <Jobs /> },
//       // { path: "jobs/view", element: <JobView /> },
//       // { path: "venues/approval", element: <VenuesApproval /> },
//       // { path: "venues/view", element: <VenueView /> },
//     ],
//   },

//   // Public route
//   { path: "login", element: <Login /> },
// ]);

// export default function App() {
//   return <RouterProvider router={router} />;
// }






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






// // src/App.jsx
// import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import RootLayout from "./layouts/RootLayout";
// import Home from "./pages/Home";
// import Users from "./pages/Users";
// import Faqs from "./pages/Faqs";
// import UserFeedBack from "./pages/UserFeedBack";
// import Appsettings from "./pages/appSettings";
// import Login from "./pages/Login";
// import Contract from "./pages/Contract";
// import Profile from "./pages/Profile";
// import NotFound from "./pages/NotFound";
// import NoAccess from "./pages/NoAccess";
// import ProtectedRoute from "./auth/ProtectedRoute";

// const router = createBrowserRouter([
//   // Public
//   { path: "/login", element: <Login /> },

//   // Admin-only wrapper (all routes below require role=admin, active)
//   {
//     element: <ProtectedRoute />, // allowStaff=false by default (admin only)
//     children: [
//       {
//         path: "/",
//         element: <RootLayout />,
//         children: [
//           // Home: require "view_reports" (or drop requirePerm if everyone can see)
//           {
//             element: <ProtectedRoute requirePerm="view_reports" />,
//             children: [{ index: true, element: <Home /> }],
//           },

//           // Users: require "manage_users"
//           {
//             element: <ProtectedRoute requirePerm="manage_users" />,
//             children: [{ path: "users", element: <Users /> }],
//           },

//           // Contracts: require "manage_contracts"
//           {
//             element: <ProtectedRoute requirePerm="manage_contracts" />,
//             children: [{ path: "contract", element: <Contract /> }],
//           },

//           // FAQs: require "manage_faqs"
//           {
//             element: <ProtectedRoute requirePerm="manage_faqs" />,
//             children: [{ path: "faqs", element: <Faqs /> }],
//           },

//           // Feedback: (pick a perm or none). Example uses "view_reports".
//           {
//             element: <ProtectedRoute requirePerm="view_reports" />,
//             children: [{ path: "user-feedback", element: <UserFeedBack /> }],
//           },

//           // App settings: pick a perm; reusing "manage_faqs" is fine if you don’t have a dedicated one
//           {
//             element: <ProtectedRoute requirePerm="manage_faqs" />,
//             children: [{ path: "content", element: <Appsettings /> }],
//           },

//           // Profile: usually any admin can view their own
//           { path: "profile", element: <Profile /> },

//           { path: "no-access", element: <NoAccess /> },
//           { path: "*", element: <NotFound /> },
//         ],
//       },
//     ],
//   },
// ]);

// export default function App() {
//   return <RouterProvider router={router} />;
// }
