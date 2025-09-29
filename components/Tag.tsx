
import React from 'react';

interface TagProps {
  children: React.ReactNode;
  color?: string;
}

// FIX: Changed to a const with React.FC to properly handle the key prop.
const Tag: React.FC<TagProps> = ({ children, color = 'bg-indigo-100 text-indigo-800' }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {children}
    </span>
  );
}

export default Tag;