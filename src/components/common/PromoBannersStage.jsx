import React from 'react';
import { useNavigate } from 'react-router-dom';
import { aiFruitBasket, aiVegBasket, aiDeliveryScooter } from '../../assets/images/aiImageAssets';

const promoItems = [
  {
    id: 'fruits',
    title: 'Big Savings on',
    subTitle: 'Fresh Fruits',
    subText: 'Up to 30% OFF',
    cta: 'Shop Now',
    route: '/customer/shop?category=Fruit',
    bgColor: 'linear-gradient(135deg, #eefbe8 0%, #f4fdf0 55%, #e6f9e0 100%)',
    borderColor: '#dcfce7',
    titleColor: '#166534',
    subTitleColor: '#15803d',
    subTextColor: '#16a34a',
    btnBg: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800',
    shadowColor: 'shadow-emerald-600/20',
    image: aiFruitBasket,
  },
  {
    id: 'vegetables',
    title: 'Weekend Special',
    subTitle: 'Vegetables Combo',
    subText: 'Up to 25% OFF',
    cta: 'Shop Now',
    route: '/customer/shop?category=Vegetables',
    bgColor: 'linear-gradient(135deg, #fffbeb 0%, #fff7ed 55%, #fef08a 100%)',
    borderColor: '#fef08a',
    titleColor: '#ea580c',
    subTitleColor: '#f97316',
    subTextColor: '#ea580c',
    btnBg: 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700',
    shadowColor: 'shadow-orange-500/20',
    image: aiVegBasket,
  },
  {
    id: 'delivery',
    title: 'Free Delivery',
    subTitle: 'On orders above ₹499',
    subText: '',
    cta: 'Shop Now',
    route: '/customer/shop',
    bgColor: 'linear-gradient(135deg, #fff0f3 0%, #ffe4e8 55%, #fce7f3 100%)',
    borderColor: '#fecdd3',
    titleColor: '#e11d48',
    subTitleColor: '#475569',
    subTextColor: '#e11d48',
    btnBg: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800',
    shadowColor: 'shadow-rose-600/20',
    image: aiDeliveryScooter,
  },
];

const PromoBannersStage = ({ className = '' }) => {
  const navigate = useNavigate();

  return (
    <div className={`w-full max-w-[1280px] mx-auto px-1 sm:px-2 ${className}`}>
      <style>{`
        @keyframes banner3DFloat {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-5px) scale(1.02);
          }
        }
        .banner-3d-img {
          animation: banner3DFloat 4s ease-in-out infinite;
          filter: drop-shadow(0 10px 15px rgba(0, 0, 0, 0.08));
        }
        .banner-card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .banner-card-hover:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 25px -5px rgba(0, 0, 0, 0.08);
        }
      `}</style>

      {/* 3-Column Responsive Stage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
        {promoItems.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(item.route)}
            className="banner-card-hover relative overflow-hidden rounded-2xl border p-4 sm:p-5 flex items-center justify-between h-[155px] sm:h-[165px] cursor-pointer"
            style={{
              background: item.bgColor,
              borderColor: item.borderColor,
            }}
          >
            {/* Left Content Block */}
            <div className="z-10 flex flex-col justify-between h-full max-w-[58%]">
              <div>
                <p
                  className="text-xs sm:text-sm font-bold tracking-tight mb-0.5"
                  style={{ color: item.titleColor }}
                >
                  {item.title}
                </p>

                <h3
                  className="text-lg sm:text-xl lg:text-[22px] font-black leading-tight tracking-tight"
                  style={{ color: item.id === 'delivery' ? item.titleColor : item.subTitleColor }}
                >
                  {item.id === 'delivery' ? item.title : item.subTitle}
                </h3>

                {item.id === 'delivery' ? (
                  <p className="text-xs sm:text-sm font-bold text-slate-600 mt-0.5">
                    {item.subTitle}
                  </p>
                ) : (
                  <p
                    className="text-xs sm:text-sm font-extrabold mt-0.5"
                    style={{ color: item.subTextColor }}
                  >
                    {item.subText}
                  </p>
                )}
              </div>

              {/* Shop Now CTA Button */}
              <div className="mt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(item.route);
                  }}
                  className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs sm:text-sm font-black text-white shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${item.btnBg} ${item.shadowColor}`}
                >
                  {item.cta}
                </button>
              </div>
            </div>

            {/* Right 3D Visual Image */}
            <div className="relative w-[42%] h-full flex items-center justify-end overflow-visible">
              <img
                src={item.image}
                alt={item.subTitle}
                className="banner-3d-img w-full h-full object-contain max-h-[135px] sm:max-h-[145px] transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromoBannersStage;
