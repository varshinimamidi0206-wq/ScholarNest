import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import NestGuideModal from '../components/NestGuideModal';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {/* Floating NestGuide Assistant accessible platform-wide */}
      <NestGuideModal />
    </div>
  );
}
