import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail } from 'lucide-react'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-primary-900 border-t-8 border-gold-400 text-white font-body mt-auto relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          
          <div className="md:col-span-4">
            <img src="/assets/images/logo.png" alt="RRDCH Logo" className="h-[4.5rem] w-auto mb-8 filter brightness-0 invert drop-shadow-md" />
            <p className="text-sm text-ivory-100 font-ui leading-relaxed opacity-80 mb-8 max-w-sm tracking-wide">
              Empowering dental professionals and delivering world-class patient care since 1992. Recognized by DCI, affiliated to RGUHS.
            </p>
            <div className="flex gap-4">
              <a href="#" className="h-10 w-10 flex border items-center justify-center rounded-full border-neutral-700 hover:border-gold-400 hover:text-gold-400 transition-colors"><Facebook size={16} /></a>
              <a href="#" className="h-10 w-10 flex border items-center justify-center rounded-full border-neutral-700 hover:border-gold-400 hover:text-gold-400 transition-colors"><Twitter size={16} /></a>
              <a href="#" className="h-10 w-10 flex border items-center justify-center rounded-full border-neutral-700 hover:border-gold-400 hover:text-gold-400 transition-colors"><Instagram size={16} /></a>
              <a href="#" className="h-10 w-10 flex border items-center justify-center rounded-full border-neutral-700 hover:border-gold-400 hover:text-gold-400 transition-colors"><Linkedin size={16} /></a>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-ui text-[12px] font-extrabold text-gold-400 mb-6 uppercase tracking-widest">Academic Hub</h4>
            <ul className="flex flex-col gap-4 font-ui text-[13px] text-neutral-300 font-bold tracking-wide">
              <li><Link to="/academics" className="border-b border-transparent hover:border-gold-400 transition-colors">BDS Programme</Link></li>
              <li><Link to="/academics" className="border-b border-transparent hover:border-gold-400 transition-colors">MDS Programmes</Link></li>
              <li><Link to="/research" className="border-b border-transparent hover:border-gold-400 transition-colors">PhD & Research Central</Link></li>
              <li><Link to="/students" className="border-b border-transparent hover:border-gold-400 transition-colors">Student Portal Login</Link></li>
              <li><Link to="/admissions" className="text-gold-500 border-b border-transparent hover:border-gold-400 transition-colors">Admissions 2025</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-ui text-[12px] font-extrabold text-teal-400 mb-6 uppercase tracking-widest">Clinical Services</h4>
            <ul className="flex flex-col gap-4 font-ui text-[13px] text-neutral-300 font-bold tracking-wide">
              <li><Link to="/hospital/appointments" className="border-b border-transparent hover:border-teal-400 transition-colors">Online Booking Portal</Link></li>
              <li><Link to="/hospital/track" className="border-b border-transparent hover:border-teal-400 transition-colors">Track Application Status</Link></li>
              <li><Link to="/hospital/live" className="text-coral-400 border-b border-transparent hover:border-coral-400 transition-colors flex gap-2 items-center"><span className="h-2 w-2 rounded-full bg-coral-500 animate-pulse"></span> Live OPD Status</Link></li>
              <li><Link to="/hospital/departments" className="border-b border-transparent hover:border-teal-400 transition-colors">Department Directory</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-ui text-[12px] font-extrabold text-gold-400 mb-6 uppercase tracking-widest">Contact Register</h4>
            <ul className="flex flex-col gap-4 font-ui text-sm text-neutral-300 opacity-90 leading-relaxed">
              <li className="flex gap-4 items-start">
                <MapPin size={22} className="text-gold-400 shrink-0 mt-0.5" />
                <span className="font-light">#14, Ramohalli Cross, Mysore Road, Kumbalgodu, Bengaluru – 560074</span>
              </li>
              <li className="flex gap-4 items-center font-bold tracking-wider pt-2">
                <Phone size={18} className="text-gold-400 shrink-0" />
                <span>+91 80 1234 5678</span>
              </li>
              <li className="flex gap-4 items-center">
                <Mail size={18} className="text-gold-400 shrink-0" />
                <span className="font-light">admissions@rrdch.org</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-xs font-ui opacity-50 font-bold tracking-wider uppercase">
          <p>© 2025 RRDCH Bangalore. Supported By MoHFW.</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Charter</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <button onClick={() => window.scrollTo(0,0)} className="hover:text-gold-400 transition-colors">Back to top ↑</button>
          </div>
        </div>
      </div>
    </footer>
  )
}
