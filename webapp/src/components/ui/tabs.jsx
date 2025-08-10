import React, { useState } from 'react'

export function Tabs({ defaultValue, children, className='' }) {
  const [value, setValue] = useState(defaultValue)
  return <div className={className} data-value={value}>{React.Children.map(children, child => React.cloneElement(child, { value, setValue }))}</div>
}
export function TabsList({ children, className='' }) { return <div className={`flex gap-2 ${className}`}>{children}</div> }
export function TabsTrigger({ value: tabValue, children, value, setValue }) {
  const active = value === tabValue
  return <button className={`px-3 py-1 rounded-lg border ${active? 'bg-blue-500 text-white':'bg-white'}`} onClick={()=>setValue(tabValue)}>{children}</button>
}
export function TabsContent({ value: tabValue, children, value, className='' }) { return value === tabValue ? <div className={className}>{children}</div> : null }


