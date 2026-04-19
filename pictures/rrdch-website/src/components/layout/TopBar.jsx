import { useTranslation } from 'react-i18next'
import { Phone, Mail } from 'lucide-react'

export default function TopBar() {
  const { t, i18n } = useTranslation()

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'kn' : 'en'
    i18n.changeLanguage(nextLang)
    localStorage.setItem('lang', nextLang)
  }

  return (
    <div className="bg-primary-900 text-ivory-100 h-10 flex items-center justify-between px-4 lg:px-8 text-xs font-ui tracking-wide transition-colors z-50 relative">
      <div className="flex items-center w-full max-w-7xl mx-auto justify-between">
        <div className="flex gap-6">
          <span className="flex items-center gap-2 hover:text-gold-400 transition-colors cursor-pointer">
            <Phone size={14} className="text-gold-400"/> {t('topbar.phone')}
          </span>
          <span className="hidden md:flex items-center gap-2 hover:text-gold-400 transition-colors cursor-pointer">
            <Mail size={14} className="text-gold-400"/> {t('topbar.email')}
          </span>
        </div>
        <div className="flex gap-6 items-center">
          <a href="/students" className="hidden md:block hover:text-gold-400 transition-colors">Student Portal</a>
          <a href="/hospital/track" className="hidden md:block hover:text-gold-400 transition-colors">Patient Area</a>
          <div className="h-4 w-px bg-primary-700 hidden md:block"></div>
          <button 
            onClick={toggleLanguage} 
            className="hover:text-gold-400 flex items-center font-bold transition-colors"
          >
            {i18n.language === 'en' ? 'EN | ಕನ್ನಡ' : 'ಕನ್ನಡ | EN'}
          </button>
        </div>
      </div>
    </div>
  )
}
