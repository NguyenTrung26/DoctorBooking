'use client'
import Link from 'next/link'
import useInViewAnimation from './useInViewAnimation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Doctor {
  id: string
  name: string
  specialty: string
  image_url: string
}

export function Hero() {
  const { ref, isVisible } = useInViewAnimation()
  const [doctors, setDoctors] = useState<Doctor[]>([])

  useEffect(() => {
    const fetchDoctors = async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(3)
      if (!error && data) setDoctors(data)
    }
    fetchDoctors()
  }, [])

  return (
    <section
      ref={ref}
      className={`relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-20 md:py-32 px-4 transition-all duration-1000
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}
      `}
    >
      {/* Animated background shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 drop-shadow-2xl leading-tight">
          Đặt lịch khám bệnh<br />
          <span className="text-yellow-300">nhanh chóng & dễ dàng</span>
        </h1>
        <p className="mb-10 text-lg md:text-xl max-w-2xl mx-auto drop-shadow-lg opacity-95">
          Kết nối với bác sĩ chuyên môn – Quản lý sức khỏe thông minh
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link
            href="/booking"
            className="group relative inline-flex items-center gap-2 bg-white text-indigo-700 px-8 py-4 rounded-full font-bold hover:bg-yellow-300 hover:text-indigo-900 shadow-2xl transition-all transform hover:-translate-y-1 hover:scale-105"
          >
            <span>Đặt lịch ngay</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            href="/doctors"
            className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-indigo-700 transition-all transform hover:-translate-y-1"
          >
            Xem bác sĩ
          </Link>
        </div>

        {/* Featured Doctors */}
        {doctors.length > 0 && (
          <div className="mt-12">
            <p className="text-sm uppercase tracking-wider mb-6 text-white/80">Bác sĩ nổi bật</p>
            <div className="flex justify-center gap-6 flex-wrap">
              {doctors.map((doc, idx) => (
                <div
                  key={doc.id}
                  className={`bg-white/10 backdrop-blur-lg text-white rounded-2xl p-5 w-44 shadow-xl transform transition-all duration-500 hover:scale-110 hover:bg-white/20 hover:-translate-y-2
                    ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
                  `}
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <img
                      src={doc.image_url}
                      alt={doc.name}
                      className="w-full h-full rounded-full object-cover border-3 border-white shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-green-400 w-5 h-5 rounded-full border-2 border-white"></div>
                  </div>
                  <h3 className="text-base font-bold mb-1">{doc.name}</h3>
                  <p className="text-xs text-white/80">{doc.specialty}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
