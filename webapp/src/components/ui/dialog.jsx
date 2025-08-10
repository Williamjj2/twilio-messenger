import React from 'react'

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => onOpenChange(false)}>
      <div className="bg-white rounded-xl shadow-xl" onClick={(e)=>e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
export function DialogContent({ children, className='' }) { return <div className={`p-6 ${className}`}>{children}</div> }
export function DialogHeader({ children }) { return <div className="mb-4">{children}</div> }
export function DialogTitle({ children }) { return <h3 className="text-lg font-semibold">{children}</h3> }
export function DialogDescription({ children }) { return <p className="text-sm text-gray-500">{children}</p> }


