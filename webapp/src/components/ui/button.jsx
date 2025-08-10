import React from 'react'

export function Button({ children, className = '', variant, size, asChild, ...props }) {
  const Cmp = props.href ? 'a' : 'button'
  return (
    <Cmp
      className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    >
      {children}
    </Cmp>
  )
}


