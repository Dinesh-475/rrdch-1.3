import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock, Star, Landmark, Stethoscope } from 'lucide-react'

export default function Home() {
  const { t } = useTranslation()

  return (
    <div className="font-body w-full bg-ivory-50">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full h-[85vh] lg:h-[800px] border-b-[8px] border-gold-400">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-900/40 z-10"></div>
        <img 
          src="/home page images/hospital.jpg" 
          alt="RRDCH Campus" 
          className="absolute inset-0 w-full h-full object-cover z-0 grayscale-[20%]" 
        />
        
        <div className="relative z-20 h-full flex flex-col justify-center px-4 max-w-7xl mx-auto">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             className="w-full md:w-2/3 lg:w-1/2"
           >
             <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-0.5 bg-gold-400"></div>
                <span className="font-ui text-gold-400 tracking-[0.25em] font-bold text-xs uppercase uppercase">
                  Legacy Suburbia Since 1992
                </span>
             </div>
             
             <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-heading text-white leading-[1.05] font-extrabold mb-8 drop-shadow-lg">
               {t('home.hero1')}
             </h1>
             
             <p className="text-xl md:text-2xl text-ivory-100 font-body mb-12 max-w-xl font-light leading-relaxed opacity-90">
               {t('home.hero1_sub')}
             </p>
             
             <div className="flex flex-col sm:flex-row gap-6">
               <Link 
                 to="/academics"
                 className="bg-gold-500 hover:bg-gold-400 text-white font-ui font-extrabold px-10 py-5 text-sm uppercase tracking-[0.15em] transition-all transform hover:-translate-y-1 shadow-xl flex items-center justify-center gap-4"
               >
                 Academic Programs <ArrowRight size={18} />
               </Link>
               <Link 
                 to="/hospital/appointments"
                 className="bg-transparent border border-white/30 hover:bg-white/10 text-white font-ui font-extrabold px-10 py-5 text-sm uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-4"
               >
                 Book Patient Visit
               </Link>
             </div>
           </motion.div>
        </div>
      </section>

      {/* OVERLAP STATS AND MISSION */}
      <section className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-80px] lg:mt-[-120px] mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 shadow-2xl bg-white">
          <div className="lg:col-span-7 bg-white p-12 lg:p-20 relative border-l-[6px] border-primary-900 border-t border-t-neutral-100">
             <h2 className="text-3xl lg:text-5xl font-heading font-extrabold text-primary-900 leading-tight mb-8">
                Shaping the Future of Dental Medicine
             </h2>
             <p className="text-lg text-neutral-600 font-body leading-loose mb-10">
                Recognized by the Dental Council of India and affiliated to RGUHS, our institution blends decades of academic excellence with cutting-edge clinical infrastructure.
             </p>
             <Link to="/about" className="inline-flex items-center gap-3 text-gold-500 font-ui font-extrabold hover:text-gold-400 transition-colors uppercase tracking-widest text-sm border-b-2 border-gold-500 pb-1">
                Read the President's Message <ArrowRight size={16} />
             </Link>
          </div>
          <div className="lg:col-span-5 bg-primary-900 grid grid-cols-2 p-10 gap-x-8 gap-y-12">
            <div>
               <Clock className="text-gold-400 mb-6" size={36} strokeWidth={1.5} />
               <h3 className="text-white font-heading text-4xl mb-2 font-bold drop-shadow-md">30+</h3>
               <p className="text-primary-100 font-ui text-xs tracking-widest uppercase font-bold">Years of Heritage</p>
            </div>
            <div>
               <Stethoscope className="text-gold-400 mb-6" size={36} strokeWidth={1.5} />
               <h3 className="text-white font-heading text-4xl mb-2 font-bold drop-shadow-md">250+</h3>
               <p className="text-primary-100 font-ui text-xs tracking-widest uppercase font-bold">Global Dental Chairs</p>
            </div>
            <div>
               <Landmark className="text-gold-400 mb-6" size={36} strokeWidth={1.5} />
               <h3 className="text-white font-heading text-4xl mb-2 font-bold drop-shadow-md">10</h3>
               <p className="text-primary-100 font-ui text-xs tracking-widest uppercase font-bold">PG Specialties</p>
            </div>
            <div>
               <Star className="text-teal-400 mb-6" size={36} strokeWidth={1.5} />
               <h3 className="text-white font-heading text-4xl mb-2 font-bold drop-shadow-md">'A'</h3>
               <p className="text-primary-100 font-ui text-xs tracking-widest uppercase font-bold">NAAC Accreditation</p>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK PATIENT WORKFLOW */}
      <section className="bg-ivory-100 py-32 border-b border-neutral-200">
         <div className="max-w-5xl mx-auto text-center px-4">
            <h2 className="text-4xl lg:text-6xl font-heading font-extrabold text-primary-900 mb-8">Patient Care Hub</h2>
            <p className="text-xl text-neutral-500 max-w-3xl mx-auto mb-16">
              Our 250-chair facility treats over 500 patients daily, providing unparalleled clinical exposure to our students and world-class dental care to the community.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
               <div className="bg-white p-10 border border-neutral-200 hover:border-gold-300 hover:shadow-2xl transition-all group flex flex-col text-left">
                  <div className="h-14 w-14 bg-primary-50 rounded-full flex items-center justify-center text-primary-700 mb-8 group-hover:scale-110 transition-transform">
                     1
                  </div>
                  <h4 className="font-heading text-2xl font-bold text-primary-900 mb-4">Select Dept</h4>
                  <p className="text-neutral-500 font-body mb-8 flex-grow">From OMFS to Orthodontics, select from our 10 specialized OPD wings.</p>
                  <a href="/hospital/departments" className="text-gold-500 font-ui font-extrabold uppercase text-xs tracking-widest flex items-center gap-2">Explore <ArrowRight size={14}/></a>
               </div>
               
               <div className="bg-white p-10 shadow-2xl relative scale-105 z-10 flex flex-col text-left border-t-[6px] border-gold-400">
                  <div className="h-14 w-14 bg-gold-50 rounded-full flex items-center justify-center text-gold-500 mb-8">
                     2
                  </div>
                  <h4 className="font-heading text-2xl font-bold text-primary-900 mb-4">Book Online</h4>
                  <p className="text-neutral-500 font-body mb-8 flex-grow">Skip the queues. Register your information and get a reference ID instantly.</p>
                  <a href="/hospital/appointments" className="text-primary-700 hover:text-primary-900 font-ui font-extrabold uppercase text-xs tracking-widest flex items-center gap-2">Book Now <ArrowRight size={14}/></a>
               </div>
               
               <div className="bg-white p-10 border border-neutral-200 hover:border-gold-300 hover:shadow-2xl transition-all group flex flex-col text-left">
                  <div className="h-14 w-14 bg-primary-50 rounded-full flex items-center justify-center text-primary-700 mb-8 group-hover:scale-110 transition-transform">
                     3
                  </div>
                  <h4 className="font-heading text-2xl font-bold text-primary-900 mb-4">Track Status</h4>
                  <p className="text-neutral-500 font-body mb-8 flex-grow">View live OPD waiting times or track your specific appointment progress.</p>
                  <a href="/hospital/track" className="text-gold-500 font-ui font-extrabold uppercase text-xs tracking-widest flex items-center gap-2">Track <ArrowRight size={14}/></a>
               </div>
            </div>
         </div>
      </section>
    </div>
  )
}
