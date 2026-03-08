import React from "react";

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 80 85"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: "block" }}
  >
    <rect x="0" y="0" width="15" height="25" fill="currentColor" />
    <rect x="25" y="0" width="20" height="20" fill="currentColor" />
    <rect x="55" y="0" width="25" height="15" fill="currentColor" />
    <rect x="55" y="25" width="25" height="15" fill="currentColor" />
    <rect x="25" y="40" width="20" height="20" fill="currentColor" />
    <rect x="0" y="60" width="15" height="25" fill="currentColor" />
  </svg>
);
