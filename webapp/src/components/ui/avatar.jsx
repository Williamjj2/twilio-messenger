import React from 'react'
export function Avatar({ children, className='' }) { return <div className={`inline-flex items-center justify-center rounded-full bg-gray-200 ${className}`}>{children}</div> }
export function AvatarImage({ src, alt='' }) { return <img src={src} alt={alt} className="w-full h-full object-cover rounded-full"/> }
export function AvatarFallback({ children, className='' }) { return <div className={`w-full h-full flex items-center justify-center rounded-full ${className}`}>{children}</div> }


