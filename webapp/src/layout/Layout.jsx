import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MessageCircle, Users, Settings, Phone } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

const navigationItems = [
  { title: "Mensagens", url: createPageUrl("Messages"), icon: MessageCircle },
  { title: "Contatos", url: createPageUrl("Contacts"), icon: Users },
];

const settingsItem = { title: "Configurações", url: createPageUrl("Settings"), icon: Settings };

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <style>{`
        :root { --primary: 210 100% 50%; --primary-foreground: 0 0% 100%; --background: 0 0% 100%; --foreground: 222.2 84% 4.9%; --muted: 210 40% 96%; --muted-foreground: 215.4 16.3% 46.9%; --border: 214.3 31.8% 91.4%; --ring: 210 100% 50%; }
        .message-bubble { backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
        .glass-effect { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); }
      `}</style>
      
      <SidebarProvider>
        <div className="flex w-full">
          <Sidebar className="border-r border-white/20 glass-effect">
            <SidebarHeader className="p-6 border-b border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">Messages</h2>
                  <p className="text-xs text-gray-500">Twilio Messaging</p>
                </div>
              </div>
            </SidebarHeader>
            
            <SidebarContent className="p-3 flex flex-col justify-between">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigationItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`hover:bg-white/50 hover:text-blue-700 transition-all duration-200 rounded-xl mb-2 ${
                            location.pathname === item.url 
                              ? 'bg-blue-500 text-white shadow-lg hover:bg-blue-600 hover:text-white' 
                              : ''
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-white/50 hover:text-blue-700 transition-all duration-200 rounded-xl mb-2 ${
                          location.pathname === settingsItem.url 
                            ? 'bg-blue-500 text-white shadow-lg hover:bg-blue-600 hover:text-white' 
                            : ''
                        }`}
                      >
                        <Link to={settingsItem.url} className="flex items-center gap-3 px-4 py-3">
                          <settingsItem.icon className="w-5 h-5" />
                          <span className="font-medium">{settingsItem.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <main className="flex-1 flex flex-col">
            <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 px-6 py-4 md:hidden">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200" />
                <h1 className="text-xl font-bold text-gray-900">Messages</h1>
              </div>
            </header>

            <div className="flex-1 overflow-hidden">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
      <Toaster position="top-right" richColors />
    </div>
  );
}


