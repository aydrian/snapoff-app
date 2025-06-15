import type React from "react";
import { useLocation } from "react-router";

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const location = useLocation();

  return (
    <div 
      className="animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out"
      key={location.pathname}
    >
      {children}
    </div>
  );
};