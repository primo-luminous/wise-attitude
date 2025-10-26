"use client";

import { useState } from 'react';
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import Footer from './Footer'
// ลบ NotificationHandler เพราะไม่จำเป็นแล้ว
import SessionMonitor from '../../app/components/SessionMonitor'
import { UserProvider } from '../../app/main/components/UserProvider'

export default function MainLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <UserProvider>
      <div className="main-page flex h-screen bg-gray-100">
        {/* Session Monitor */}
        <SessionMonitor />
        
        {/* ลบ NotificationHandler เพราะไม่จำเป็นแล้ว */}
        
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Navbar */}
          <Navbar 
            onToggleSidebar={toggleSidebar}
            sidebarOpen={sidebarOpen}
          />
          
          {/* Content */}
          <main className="flex-1 overflow-auto p-6 mt-16">
            {children}
          </main>
          
          {/* Footer */}
          <Footer />
        </div>
      </div>
    </UserProvider>
  )
}
