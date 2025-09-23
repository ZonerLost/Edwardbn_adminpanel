import React from "react";

export default function DrawerSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Contact */}
      <section className="space-y-2">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
        <div className="h-10 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-200 rounded" />
        <hr className="border-gray-100" />
      </section>

      {/* Contract */}
      <section className="space-y-2">
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
        <hr className="border-gray-100" />
      </section>

      {/* Payment */}
      <section className="space-y-2">
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-200 rounded" />
        <div className="h-3 w-40 bg-gray-200 rounded" />
        <hr className="border-gray-100" />
      </section>

      {/* Files */}
      <section className="space-y-2">
        <div className="h-4 w-12 bg-gray-200 rounded" />
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-gray-200 rounded" />
          <div className="h-8 w-28 bg-gray-200 rounded" />
          <div className="h-8 w-24 bg-gray-200 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-gray-200 rounded" />
          <div className="h-8 w-28 bg-gray-200 rounded" />
          <div className="h-8 w-24 bg-gray-200 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-gray-200 rounded" />
          <div className="h-8 w-28 bg-gray-200 rounded" />
          <div className="h-8 w-24 bg-gray-200 rounded" />
        </div>
        <hr className="border-gray-100" />
      </section>
    </div>
  );
}
