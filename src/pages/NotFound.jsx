// NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="h-screen">
      <div className="h-full w-full relative">
        <img
          className="h-full w-full object-cover"
          alt="background"
          src="https://images.pexels.com/photos/65911/winter-nature-season-trees-65911.jpeg"
          loading="eager"
        />
        <div className="absolute inset-0">
          <div className="w-full h-full backdrop-blur-3xl bg-black/0">
            <div className="w-full h-full flex justify-center items-center p-4">
              <div
                className="max-w-md w-full p-5 md:py-10 space-y-5
                           bg-white/10 border-2 border-gray-500/30 rounded-md shadow-xl text-center"
              >
                <h1 className="text-6xl font-bold text-gray-950">404</h1>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Page Not Found
                </h2>
                <p className="text-gray-700">
                  Sorry, the page you’re looking for doesn’t exist.
                </p>
                <Link
                  to="/"
                  className="inline-block mt-4 text-white bg-primary hover:bg-gray-150 
                             focus:ring-1 focus:outline-none focus:ring-gray-250 
                             font-semibold rounded-lg text-sm px-5 py-2.5"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
