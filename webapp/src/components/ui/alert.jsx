import React from 'react'
export function Alert({ children, className='' }) { return <div className={`rounded-lg border p-4 ${className}`}>{children}</div> }
export function AlertTitle({ children, className='' }) { return <div className={`font-semibold mb-1 ${className}`}>{children}</div> }
export function AlertDescription({ children, className='' }) { return <div className={`${className}`}>{children}</div> }


