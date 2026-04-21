import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ToastContainer from '../common/ToastContainer';

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] transition-colors duration-500">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
