
import React from 'react';

interface TagProps {
  children: React.ReactNode;
  color?: string;
}

function Tag({ children, color = 'bg-indigo-100 text-indigo-800' }: TagProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {children}
    </span>
  );
}

export default Tag;