import React from 'react'
export function Label({ children, ...props }) {
  return <label {...props} className={`text-sm font-medium ${props.className||''}`}>{children}</label>
}


