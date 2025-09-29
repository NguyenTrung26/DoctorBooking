import { Hero } from './components/Hero'
import { Features } from './components/Features'
import { Doctors } from './components/Doctors'
import { Testimonials } from './components/Testimonials'
import ScrollToTop from './components/ScrollToTop'

export default function HomePage() {
  return (
    <div>
      <Hero />
      <Features />
      <Doctors />
      <Testimonials />
      <ScrollToTop />
    </div>
  )
}