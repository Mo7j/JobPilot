import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Fixed dark treatment (matches the marketing 404), independent of app theme.
const code3d = {
  color: '#a78bff',
  textShadow:
    '0 1px 0 #8b7cf0, 0 2px 0 #7d6ee3, 0 3px 0 #6f60d6, 0 4px 0 #6153c4, ' +
    '0 5px 0 #5446b0, 0 8px 14px rgba(0,0,0,.55), 0 0 52px rgba(139,124,255,.45)',
};

export default function NotFound() {
  return (
    <div
      className="flex min-h-dvh items-center justify-center px-6 py-12"
      style={{ background: 'radial-gradient(60rem 40rem at 50% 0%, #2b2836, #201e29 60%, #1b1924)' }}
    >
      <div className="flex w-full max-w-3xl flex-col items-center gap-6 text-center anim-rise sm:flex-row sm:gap-2 sm:text-left">
        <img
          src="/page_not_found.png"
          alt=""
          className="w-60 max-w-full shrink-0 anim-float sm:w-72"
        />
        <div className="flex flex-col items-center sm:items-start">
          <p className="font-display text-7xl font-extrabold leading-none sm:text-8xl" style={code3d}>
            404
          </p>
          <p className="mt-4 font-display text-2xl font-bold text-[#efedfa]">Page Not Found</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#9c98b8]">
            The page you're looking for doesn't exist or has moved.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white transition-transform active:scale-95"
            style={{
              background: 'linear-gradient(180deg, #8b7cff, #6c5ce7)',
              boxShadow: '0 10px 26px -8px rgba(108,92,231,.7)',
            }}
          >
            <ArrowLeft size={16} /> Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
