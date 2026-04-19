import { useTranslation } from 'react-i18next'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Calendar, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Header() {
  const { t } = useTranslation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { key: 'home', to: '/' },
    { key: 'about', to: '/about' },
    { key: 'academics', to: '/academics' },
    { key: 'hospital', to: '/hospital' },
    { key: 'research', to: '/research' },
    { key: 'admissions', to: '/admissions' },
    { key: 'contact', to: '/contact' }
  ]

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 bg-white ${scrolled ? 'shadow-lg py-2' : 'border-b border-neutral-200 py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        
        <Link to="/" className="flex items-center py-2 gap-4 group">
          <img src="/assets/images/logo.png" alt="RRDCH Logo" className="h-[3.5rem] w-[3.5rem] object-contain transition-transform group-hover:scale-105" />
          <div className="hidden md:flex flex-col">
            <h1 className="text-[20px] font-heading font-extrabold text-primary-900 tracking-tight leading-none mb-1">
              Rajarajeswari Dental College & Hospital
            </h1>
            <p className="text-[10px] text-primary-500 font-ui font-bold uppercase tracking-widest">
              Bangalore • Estd 1992 • NAAC 'A' Grade
            </p>
          </div>
        </Link>

        <nav className="hidden lg:flex gap-7 items-center font-ui text-[13px] font-bold uppercase tracking-wide">
          {navLinks.map(link => (
            <NavLink 
              key={link.key} 
              to={link.to}
              className={({ isActive }) => 
                `relative group py-2 transition-colors hover:text-primary-900 ${isActive ? 'text-primary-900' : 'text-neutral-500'}`
              }
            >
              {t(`nav.${link.key}`)}
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gold-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </NavLink>
          ))}
          
          <Link to="/hospital/appointments" className="ml-2 bg-gradient-to-r from-primary-600 to-primary-900 hover:shadow-xl text-white px-6 py-2.5 rounded-sm flex items-center gap-2 transition-all transform hover:-translate-y-0.5">
            <Calendar size={16} className="text-gold-300" /> 
            <span className="tracking-widest">APPOINTMENT</span>
          </Link>
        </nav>

        <div className="lg:hidden flex items-center">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-primary-900 p-2 focus:outline-none">
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      <div className={`lg:hidden absolute top-full left-0 w-full bg-white shadow-2xl transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-[500px] border-t border-neutral-100' : 'max-h-0'}`}>
        <nav className="flex flex-col p-6 gap-6 font-ui">
          {navLinks.map(link => (
            <Link 
              key={link.key} 
              to={link.to} 
              className="font-bold text-primary-900 tracking-wider hover:text-gold-500 text-lg flex items-center justify-between"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t(`nav.${link.key}`)}
              <ArrowRight size={16} className="text-gold-400" />
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
