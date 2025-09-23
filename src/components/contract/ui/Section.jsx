import React from "react";

export default function Section({ title, subtitle, children }) {
  return (
    <section className="space-y-2">
      <div>
        <h3 className="font-medium">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      <div className="space-y-3">{children}</div>
      <hr className="border-gray-100" />
    </section>
  );
}
