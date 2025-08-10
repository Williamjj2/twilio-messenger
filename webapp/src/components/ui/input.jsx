import React from 'react'

export function Input(props) {
  return <input {...props} className={`w-full border rounded-md px-3 py-2 ${props.className||''}`} />
}

export function Textarea(props) {
  return <textarea {...props} className={`w-full border rounded-md px-3 py-2 ${props.className||''}`} />
}


