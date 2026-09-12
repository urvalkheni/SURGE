import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="h-screen max-h-screen w-screen overflow-hidden bg-slate-50 flex flex-col text-slate-900 selection:bg-blue-500/20 selection:text-blue-900">
      <Header />
      <div className="flex flex-1 overflow-hidden min-h-0 w-full">
        <Sidebar />
        <main className="flex-1 overflow-y-auto min-h-0 p-4 lg:p-6 space-y-6 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
