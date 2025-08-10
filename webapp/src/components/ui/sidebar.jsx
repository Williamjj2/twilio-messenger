import React from 'react'
export function SidebarProvider({ children }) { return <>{children}</> }
export function Sidebar({ children, className='' }) { return <aside className={`w-64 hidden md:block ${className}`}>{children}</aside> }
export function SidebarHeader({ children, className='' }) { return <div className={className}>{children}</div> }
export function SidebarContent({ children, className='' }) { return <div className={className}>{children}</div> }
export function SidebarGroup({ children }) { return <div>{children}</div> }
export function SidebarGroupContent({ children }) { return <div>{children}</div> }
export function SidebarMenu({ children }) { return <ul>{children}</ul> }
export function SidebarMenuItem({ children }) { return <li>{children}</li> }
export function SidebarMenuButton({ children, asChild, className='' }) { return <div className={className}>{children}</div> }
export function SidebarTrigger({ className='' }) { return <div className={className}></div> }


