import { Outlet } from "react-router-dom";
import Sidebar from "../components/partials/sidebar";
import { Toaster } from "react-hot-toast";

export default function RootLayout() {
  return (
    <div>
      <Sidebar />
      <div className="lg:ml-64">
        <Outlet />
        <Toaster
          position="top-right"
          toastOptions={{
            // optional tweaks
            duration: 3500,
          }}
          containerStyle={{ zIndex: 999999 }} // in case any overlay covers it
        />
      </div>
    </div>
  );
}
