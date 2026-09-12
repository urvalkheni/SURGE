import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useApp } from "../../context/AppContext";

export default function Layout() {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useApp();

  return (
    <div className="h-screen max-h-screen w-screen overflow-hidden bg-slate-50 flex flex-col text-slate-900 selection:bg-blue-500/20 selection:text-blue-900">
      <Header />
      <div className="flex flex-1 overflow-hidden min-h-0 w-full relative">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex h-full shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Drawer */}
        {mobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" 
              onClick={() => setMobileSidebarOpen(false)} 
            />
            {/* Slide-out Sidebar */}
            <div className="relative z-50 w-64 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col animate-fade-in">
              <Sidebar isMobile={true} onClose={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 bg-slate-50 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
