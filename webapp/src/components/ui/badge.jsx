import React from 'react'
export function Badge({ children, className='' }) {
  return <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium text-white bg-blue-600 ${className}`}>{children}</span>
}


