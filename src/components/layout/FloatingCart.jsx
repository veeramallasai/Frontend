import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomer } from '../../context/CustomerContext';

const FloatingCart = () => {
  const { cart = [] } = useCustomer();
  const location = useLocation();

  // Calculate totals
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Do not show on Cart or Checkout pages
  const hidePaths = ['/cart', '/checkout', '/order-success'];
  const shouldHide = hidePaths.some(path => location.pathname.startsWith(path));

  if (cartCount === 0 || shouldHide) return null;

  // Get up to 3 distinct product images from the cart
  const cartImages = cart.slice(0, 3).map(item => item.product?.image).filter(Boolean);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none"
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="bg-white rounded-[2rem] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] border border-slate-100 p-3 sm:p-4 flex items-center justify-between pointer-events-auto backdrop-blur-md bg-white/95 transition-all">
            
            <div className="flex items-center gap-4">
              {/* Image Stack */}
              <div className="flex -space-x-3 ml-2">
                {cartImages.map((img, index) => (
                  <div key={index} className="w-12 h-12 rounded-xl border-[3px] border-white shadow-sm overflow-hidden bg-slate-50 relative z-[1]">
                    <img src={img} alt="Cart item" className="w-full h-full object-cover" />
                  </div>
                ))}
                {cartCount > cartImages.length && (
                  <div className="w-12 h-12 rounded-xl border-[3px] border-white shadow-sm bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 relative z-0">
                    +{cartCount - cartImages.length}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col">
                <span className="text-[15px] font-extrabold text-slate-800">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            <Link 
              to="/cart"
              className="bg-[#0070a6] text-white px-6 py-2.5 rounded-full font-bold text-[15px] hover:bg-[#005c8a] transition-colors shadow-sm flex items-center gap-2"
            >
              View Cart
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingCart;
