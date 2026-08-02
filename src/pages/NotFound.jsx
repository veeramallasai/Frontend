import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-6 relative overflow-hidden text-left">
      {/* Decorative Blur Background Circles */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-skyBlue/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full glassmorphism-card rounded-3xl p-10 text-center relative z-10"
      >
        <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary animate-bounce">
          <HelpCircle className="w-8 h-8" />
        </div>

        <h1 className="text-7xl font-extrabold text-slate-800 mb-2 select-none tracking-tighter">
          404
        </h1>
        <h2 className="text-xl font-bold text-slate-700 mb-4 leading-snug">
          Page Not Found
        </h2>
        <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
          The page you are looking for does not exist, has been archived, or was moved. Let's get you back home to safety.
        </p>

        <Link to="/" className="inline-block w-full">
          <Button variant="gradient" className="w-full" icon={ArrowLeft} iconPosition="left">
            Back to Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
