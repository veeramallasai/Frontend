import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children, title = 'Welcome Back', subtitle = 'Harvesting trust, delivering fresh.' }) => {
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center py-12 px-4 overflow-hidden">
      {/* Top-Left Back to Home Button */}
      <Link
        to="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-30 inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/90 hover:bg-white text-slate-800 hover:text-emerald-700 font-extrabold text-xs sm:text-sm shadow-md border border-white/60 backdrop-blur-md transition-all cursor-pointer hover:-translate-x-1"
        title="Return to Farm2Home Homepage"
      >
        <ArrowLeft className="w-4 h-4 text-emerald-600" />
        <span>Back to Home</span>
      </Link>
      {/* Beautiful CSS Gradient Background (Replaces Video to fix ORB warnings) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#134E5E] to-[#71B280] z-0" />
      
      {/* Decorative blurred circles for texture */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#86d89a] rounded-full mix-blend-overlay filter blur-[100px] opacity-60 z-0 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#1a6679] rounded-full mix-blend-overlay filter blur-[120px] opacity-70 z-0" />
      
      {/* Frosted dark overlay */}
      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px] z-10" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-lg z-20 relative"
      >
        {/* Glassmorphic Auth Card Wrapper */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl overflow-hidden p-8 sm:p-10">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="flex items-center space-x-2 text-primary font-bold text-2xl select-none mb-3">
              <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <span className="font-extrabold text-slate-800 tracking-tight">
                Farm<span className="text-primary font-bold">2Home</span>
              </span>
            </Link>
            
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 text-center tracking-tight mb-1">
              {title}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 text-center">
              {subtitle}
            </p>
          </div>

          {/* Children Form Contents */}
          {children}

        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
