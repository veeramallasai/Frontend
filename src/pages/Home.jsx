import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ── floating leaf particles config ─────────────────────────── */
const PARTICLES = [
  { id: 1, x: 5,  y: 12, size: 18, delay: 0,    dur: 6   },
  { id: 2, x: 88, y: 8,  size: 14, delay: 1.2,  dur: 7   },
  { id: 3, x: 62, y: 4,  size: 20, delay: 0.5,  dur: 5.5 },
  { id: 4, x: 18, y: 72, size: 12, delay: 2,    dur: 8   },
  { id: 5, x: 78, y: 82, size: 16, delay: 0.8,  dur: 6.5 },
  { id: 6, x: 44, y: 92, size: 10, delay: 1.8,  dur: 7.5 },
];

/* ── 3-D card tilt on mouse move ─────────────────────────────── */
function use3DTilt(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      el.style.transform = `perspective(900px) rotateY(${dx * 9}deg) rotateX(${-dy * 9}deg) scale3d(1.02,1.02,1.02)`;
    };
    const onLeave = () => {
      el.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)';
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [ref]);
}

/* ══════════════════════════════════════════════════════════════
   Home component
══════════════════════════════════════════════════════════════ */
const Home = () => {
  const navigate  = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const cardRef   = useRef(null);
  const [show, setShow] = useState(false);

  use3DTilt(cardRef);
  useEffect(() => { const t = setTimeout(() => setShow(true), 60); return () => clearTimeout(t); }, []);

  const handleFarmerEnrollment = () => {
    if (isAuthenticated && user?.role === 'farmer') {
      navigate('/farmer-registration');
    } else {
      navigate('/register', { state: { role: 'farmer' } });
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp3d {
          from { opacity:0; transform:translateY(44px) translateZ(-70px) rotateX(20deg); }
          to   { opacity:1; transform:translateY(0)    translateZ(0)     rotateX(0deg);  }
        }
        @keyframes fadeIn3d {
          from { opacity:0; transform:scale(.86) translateZ(-40px); }
          to   { opacity:1; transform:scale(1)   translateZ(0);     }
        }
        @keyframes bob {
          0%,100%{ transform:translateY(0)   rotate(0deg);  }
          25%    { transform:translateY(-9px) rotate(-2deg); }
          75%    { transform:translateY(5px)  rotate(2deg);  }
        }
        @keyframes bobR {
          0%,100%{ transform:translateY(0)   rotate(0deg); }
          30%    { transform:translateY(7px)  rotate(2deg); }
          70%    { transform:translateY(-8px) rotate(-1deg);}
        }
        @keyframes floatLeaf {
          0%,100%{ transform:translateY(0)    rotate(0deg)  scale(1);    opacity:.5;  }
          40%    { transform:translateY(-24px) rotate(22deg) scale(1.1);  opacity:.85; }
          70%    { transform:translateY(-10px) rotate(-12deg)scale(.93);  opacity:.65; }
        }
        @keyframes glowPulse {
          0%,100%{ box-shadow:0 0 0 0 rgba(52,211,153,0),  0 20px 60px rgba(0,0,0,.12); }
          50%    { box-shadow:0 0 44px 8px rgba(52,211,153,.38),0 20px 60px rgba(0,0,0,.18); }
        }
        @keyframes shimmer {
          0%  { background-position:-200% center; }
          100%{ background-position: 200% center; }
        }
        .shimmer-text{
          background:linear-gradient(90deg,#059669 0%,#10b981 30%,#06b6d4 50%,#10b981 70%,#059669 100%);
          background-size:200% auto;
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
          animation:shimmer 3s linear infinite;
        }
        .card-3d{ transition:transform .13s ease-out; transform-style:preserve-3d; will-change:transform; }
        .btn-primary-3d{
          transition:transform .15s ease,box-shadow .15s ease;
        }
        .btn-primary-3d:hover{ transform:translateY(-4px) scale(1.04); box-shadow:0 10px 28px rgba(16,185,129,.4); }
        .btn-primary-3d:active{ transform:translateY(1px) scale(.97); box-shadow:0 2px 8px rgba(16,185,129,.2); }
        .btn-outline-3d{ transition:transform .15s ease,box-shadow .15s ease; }
        .btn-outline-3d:hover{ transform:translateY(-3px) scale(1.03); box-shadow:0 6px 18px rgba(0,0,0,.1); }
        .btn-outline-3d:active{ transform:translateY(1px) scale(.97); }
      `}</style>

      <div className="w-full min-h-screen bg-white pb-10 overflow-hidden">

        {/* ── HERO ────────────────────────────────────────────── */}
        <section className="max-w-[1140px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8" style={{perspective:'1200px'}}>
          <div className="grid lg:grid-cols-2 items-center gap-8 lg:gap-10">

            {/* LEFT */}
            <div>
              <span
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-extrabold tracking-wide text-emerald-700 uppercase"
                style={{ animation: show ? 'fadeIn3d .7s ease both' : 'none' }}
              >
                <Leaf className="h-3.5 w-3.5" />
                Rural Empowerment Project
              </span>

              <h1
                className="mt-3 text-2xl sm:text-4xl lg:text-[2.85rem] leading-[1.1] font-black tracking-tight text-slate-900"
                style={{ animation: show ? 'fadeUp3d .78s cubic-bezier(.16,1,.3,1) .1s both' : 'none', transformStyle:'preserve-3d' }}
              >
                Fresh organic produce
                <span className="block shimmer-text">Direct from fields</span>
                to your dining table.
              </h1>

              <p
                className="mt-4 max-w-[520px] text-sm sm:text-base leading-relaxed text-slate-600 font-medium"
                style={{ animation: show ? 'fadeUp3d .78s cubic-bezier(.16,1,.3,1) .22s both' : 'none' }}
              >
                Skip the warehouse and middlemen. Support local farming communities while treating your family to healthy, verified pesticide-free fruits, veggies, and grains.
              </p>

              <div
                className="mt-5 flex flex-wrap items-center gap-2.5"
                style={{ animation: show ? 'fadeUp3d .78s cubic-bezier(.16,1,.3,1) .36s both' : 'none' }}
              >
                <button
                  onClick={handleFarmerEnrollment}
                  className="btn-primary-3d inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 px-4.5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md cursor-pointer hover:opacity-90 transition-all"
                >
                  Farmer Enrollment
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigate('/customer')}
                  className="btn-outline-3d rounded-xl border border-slate-300 px-4.5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:border-slate-400 hover:bg-slate-50 cursor-pointer"
                >
                  Customer Shop
                </button>
                <button
                  onClick={() => navigate('/catalog')}
                  className="btn-outline-3d rounded-xl border border-slate-300 px-4.5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:border-slate-400 hover:bg-slate-50 cursor-pointer"
                >
                  Explore Platform
                </button>
              </div>
            </div>

            {/* RIGHT — 3-D tilt card */}
            <div
              className="relative max-w-md mx-auto lg:max-w-none w-full"
              style={{ animation: show ? 'fadeIn3d .9s cubic-bezier(.16,1,.3,1) .18s both' : 'none' }}
            >
              {/* tilt card */}
              <div
                ref={cardRef}
                className="card-3d relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-slate-100"
                style={{ animation:'glowPulse 3.5s ease-in-out infinite', zIndex:1 }}
              >
                <img
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80"
                  alt="Farm workers in paddy fields"
                  className="h-[230px] sm:h-[280px] w-full object-cover"
                  style={{ transform:'translateZ(0)', display:'block' }}
                />

                {/* badges bob independently */}
                <div
                  className="absolute left-3.5 top-3.5 inline-flex items-center gap-2 rounded-xl bg-white/95 backdrop-blur-xs px-3.5 py-2 text-xs sm:text-sm font-extrabold text-slate-700 shadow-sm"
                  style={{ animation:'bob 4s ease-in-out infinite', transformOrigin:'center bottom' }}
                >
                  <Leaf className="h-4 w-4 text-emerald-600" />
                  100% Organic
                </div>

                <div
                  className="absolute bottom-3.5 right-3.5 inline-flex items-center gap-2 rounded-xl bg-white/95 backdrop-blur-xs px-3.5 py-2 text-xs sm:text-sm font-extrabold text-slate-700 shadow-sm"
                  style={{ animation:'bobR 4.5s ease-in-out .6s infinite', transformOrigin:'center top' }}
                >
                  <BadgeCheck className="h-4 w-4 text-sky-600" />
                  Audit Certified
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── SHOP BY CATEGORY ────────────────────────────────── */}
        <section className="max-w-[1140px] mx-auto px-4 sm:px-6 mt-8">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Shop by Category</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/leafy-vegetables')}
              className="group overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-500 via-green-500 to-cyan-500 p-4.5 text-left text-white shadow-sm transition hover:-translate-y-1 hover:shadow-md cursor-pointer"
            >
              <p className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-black uppercase tracking-wide">
                <Leaf className="h-3.5 w-3.5" />
                Fresh Today
              </p>
              <h3 className="mt-2.5 text-xl font-black">Leafy Vegetables</h3>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-white/90">Spinach, Methi, Gongura and 30+ more greens.</p>
              <p className="mt-3.5 inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold">
                Explore Category
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </p>
            </button>
          </div>
        </section>

      </div>
    </>
  );
};

export default Home;
