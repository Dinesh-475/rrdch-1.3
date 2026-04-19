import { Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

// Layouts
import TopBar from './components/layout/TopBar'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'

// Pages
import Home from './pages/Home'
// Add more pages here later

function App() {
  const { i18n } = useTranslation()

  useEffect(() => {
    document.body.className = i18n.language === 'kn' ? 'font-kannada' : 'font-body'
  }, [i18n.language])

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 text-neutral-800">
      <TopBar />
      <Header />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App
