import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import LanguageToggle from './LanguageToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinks = [
    { to: '/', label: t('nav.dashboard') },
    { to: '/tests', label: t('nav.tests') },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-glow-blue transition-shadow duration-300 group-hover:shadow-lg">
              E
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">
              Evalix
            </span>
          </Link>

          {/* Center Navigation */}
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === link.to
                    ? 'text-white bg-white/[0.08]'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <div className="w-px h-6 bg-white/[0.08]" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/80 to-violet-500/80 flex items-center justify-center text-xs font-semibold text-white ring-1 ring-white/10">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="text-neutral-500 hover:text-red-400 text-sm font-medium transition-colors duration-200"
              >
                {t('nav.logout')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
