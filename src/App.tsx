import { useEffect, useState } from 'react'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Home from './pages/Home'
import BookTelehealth from './pages/BookTelehealth'
import RequestSubmitted from './pages/RequestSubmitted'
import OurDoctors from './pages/OurDoctors'
import DoctorJobs from './pages/DoctorJobs'
import FAQ from './pages/FAQ'
import Contact from './pages/Contact'

const PAGES_WITHOUT_FOOTER = ['submitted']

// Pages that render Home but scroll to a specific section instead of the top.
const SECTION_PAGES: Record<string, string> = {
  'how-it-works': 'how-it-works',
}

export default function App() {
  const [page, setPage] = useState('home')
  // Bumped on every navigation so re-selecting the current page still scrolls.
  const [navCount, setNavCount] = useState(0)

  const navigate = (p: string) => {
    setPage(p)
    setNavCount((n) => n + 1)
  }

  // Scrolling is a side effect — it belongs here, not in the render path.
  useEffect(() => {
    const sectionId = SECTION_PAGES[page]
    const target = sectionId ? document.getElementById(sectionId) : null

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [page, navCount])

  const renderPage = () => {
    switch (page) {
      case 'home':
      case 'how-it-works':
        return <Home setPage={navigate} />
      case 'book':
        return <BookTelehealth setPage={navigate} />
      case 'submitted':
        return <RequestSubmitted setPage={navigate} />
      case 'doctors':
        return <OurDoctors setPage={navigate} />
      case 'jobs':
        return <DoctorJobs />
      case 'faq':
        return <FAQ />
      case 'contact':
        return <Contact />
      default:
        return <Home setPage={navigate} />
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Nav currentPage={page} setPage={navigate} />
      <main className="flex-1">
        {renderPage()}
      </main>
      {!PAGES_WITHOUT_FOOTER.includes(page) && <Footer setPage={navigate} />}
    </div>
  )
}
