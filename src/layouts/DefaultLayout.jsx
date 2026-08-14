import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FloatingCart from '../components/layout/FloatingCart';
const DefaultLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 w-full overflow-x-hidden">
      {/* Header Sticky Navbar */}
      <Navbar />

      {/* Main Page Area */}
      <motion.main 
        className="flex-grow pt-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Outlet />
      </motion.main>

      <FloatingCart />
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default DefaultLayout;
