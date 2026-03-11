import { Link, type To } from "react-router-dom";
import { useDirection } from "../hooks/useDirection";
import React from "react";
import { FaGreaterThan, FaHome, FaLessThan } from "react-icons/fa";

interface RouteProps {
  items: { path: To; name: string }[];
  routlength: number;
}

export default function RouteBox({ items, routlength }: RouteProps) {
  const dir = useDirection(); // Assuming this hook exists and works as intended

  return (
    <div
      className="
      flex  items-center
       mb-3 p-3 sm:p-4
      bg-gradient-to-r from-green-500 to-emerald-600
      rounded-sm shadow-md
      text-white font-semibold text-sm
      whitespace-nowrap
      min-w-0
      border border-green-400
    "
    >
      {/* Home Icon */}
      <Link
        to={"/"}
        className="
          flex items-center justify-center
          p-2 rounded-full
          bg-white bg-opacity-25
          hover:bg-opacity-40 transition-all duration-300
          focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-60
          shrink-0
          shadow-md
        "
        aria-label="Go to Home"
      >
        <FaHome className="size-5 text-gray-400" />
      </Link>

      {/* Initial Separator */}
      <span className="mx-2 text-white text-opacity-70 shrink-0">
        {dir === "ltr" ? <FaGreaterThan /> : <FaLessThan />}
      </span>

      {/* Mapped Route Items */}
      {items.map((routeitem, index) => (
        <React.Fragment key={index}>
          <Link
            to={routeitem.path}
            className="
              flex  items-center
              px-4 py-2 rounded-full
              bg-white bg-opacity-25
              hover:bg-opacity-40 transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-60
              mr-2 shrink-0
              shadow-md
              border border-white border-opacity-30
            "
          >
            <span className="t text-gray-400">{routeitem.name}</span>
          </Link>

          {/* Separator between items, not after the last one */}
          {routlength - 1 !== index && (
            <span className="mx-2 text-white text-opacity-70 shrink-0">
              {dir === "ltr" ? <FaGreaterThan /> : <FaLessThan />}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
