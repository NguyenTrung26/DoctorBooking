'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

interface Doctor {
  id: string
  name: string
  specialty: string
  image_url: string
  bio?: string
  experience_years?: number
  education?: string
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [favorites, setFavorites] = useState<{id: string, doctor_id: string}[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const router = useRouter()

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    fetchUser()
  }, [])

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('name')
      
      if (!error && data) {
        setDoctors(data)
      }
      setLoading(false)
    }
    fetchDoctors()
  }, [])

  // Fetch favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userId) return
      const { data } = await supabase
        .from('users_favorites')
        .select('*')
        .eq('user_id', userId)
      setFavorites(data || [])
    }
    fetchFavorites()
  }, [userId])

  // Toggle favorite
  const toggleFavorite = async (doctorId: string) => {
    if (!userId) {
      alert('Vui lòng đăng nhập để thêm vào yêu thích!')
      return
    }
    
    const favorite = favorites.find(f => f.doctor_id === doctorId)
    
    if (favorite) {
      await supabase.from('users_favorites').delete().eq('id', favorite.id)
    } else {
      await supabase.from('users_favorites').insert({ 
        user_id: userId, 
        doctor_id: doctorId 
      })
    }
    
    const { data } = await supabase
      .from('users_favorites')
      .select('*')
      .eq('user_id', userId)
    setFavorites(data || [])
  }

  // Handle booking
  const handleBooking = (doctor: Doctor) => {
    router.push(`/booking?doctor_id=${doctor.id}`)
  }

  // Get unique specialties
  const specialties = Array.from(new Set(doctors.map(d => d.specialty)))

  // Filter doctors
  const filteredDoctors = doctors
    .filter(d => selectedSpecialty ? d.specialty === selectedSpecialty : true)
    .filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách bác sĩ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-indigo-100 rounded-full mb-4">
            <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Đội ngũ bác sĩ chuyên môn
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Kết nối với những chuyên gia y tế hàng đầu, giàu kinh nghiệm và tận tâm
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-gray-600">Sẵn sàng tiếp nhận</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-indigo-600 font-semibold">{filteredDoctors.length}</span>
              <span className="text-gray-600">bác sĩ</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Tìm kiếm bác sĩ theo tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 pr-12 border-2 border-gray-200 rounded-xl text-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
              />
              <svg 
                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Xem dạng lưới"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Xem dạng danh sách"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Specialty Filter */}
          <div className="mt-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Chuyên khoa:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSpecialty('')}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedSpecialty === '' 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả ({doctors.length})
              </button>
              {specialties.map((s) => {
                const count = doctors.filter(d => d.specialty === s).length
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedSpecialty(s)}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${
                      selectedSpecialty === s 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {s} ({count})
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Results Count */}
        {(searchTerm || selectedSpecialty) && (
          <div className="mb-6 text-gray-600">
            Tìm thấy <span className="font-semibold text-indigo-600">{filteredDoctors.length}</span> bác sĩ
            {searchTerm && <span> cho "{searchTerm}"</span>}
            {selectedSpecialty && <span> trong chuyên khoa "{selectedSpecialty}"</span>}
          </div>
        )}

        {/* Doctors Grid/List */}
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Không tìm thấy bác sĩ</h3>
            <p className="text-gray-600 mb-4">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedSpecialty('')
              }}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {filteredDoctors.map((doctor) => (
              viewMode === 'grid' ? (
                <DoctorCardGrid
                  key={doctor.id}
                  doctor={doctor}
                  onBooking={handleBooking}
                  onToggleFavorite={toggleFavorite}
                  isFavorite={favorites.some(f => f.doctor_id === doctor.id)}
                />
              ) : (
                <DoctorCardList
                  key={doctor.id}
                  doctor={doctor}
                  onBooking={handleBooking}
                  onToggleFavorite={toggleFavorite}
                  isFavorite={favorites.some(f => f.doctor_id === doctor.id)}
                />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Grid Card Component
function DoctorCardGrid({ 
  doctor, 
  onBooking, 
  onToggleFavorite, 
  isFavorite 
}: { 
  doctor: Doctor
  onBooking: (doc: Doctor) => void
  onToggleFavorite: (id: string) => void
  isFavorite: boolean
}) {
  return (
    <div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
      {/* Favorite Button */}
      <button
        onClick={() => onToggleFavorite(doctor.id)}
        className="absolute top-4 right-4 text-2xl transition-transform hover:scale-125 z-10"
      >
        {isFavorite ? '❤️' : '🤍'}
      </button>

      {/* Doctor Image */}
      <div className="text-center mb-4">
        <div className="relative inline-block">
          <img
            src={doctor.image_url}
            alt={doctor.name}
            className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100 shadow-md group-hover:border-indigo-300 transition-all"
          />
          <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-400 rounded-full border-3 border-white shadow-sm"></div>
        </div>
      </div>

      {/* Doctor Info */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{doctor.name}</h3>
        <span className="inline-block px-4 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
          {doctor.specialty}
        </span>
        {doctor.experience_years && (
          <p className="text-sm text-gray-600 mt-2">
            {doctor.experience_years} năm kinh nghiệm
          </p>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={() => onBooking(doctor)}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
      >
        <span className="flex items-center justify-center gap-2">
          Đặt lịch khám
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </button>
    </div>
  )
}

// List Card Component
function DoctorCardList({ 
  doctor, 
  onBooking, 
  onToggleFavorite, 
  isFavorite 
}: { 
  doctor: Doctor
  onBooking: (doc: Doctor) => void
  onToggleFavorite: (id: string) => void
  isFavorite: boolean
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Doctor Image */}
        <div className="relative flex-shrink-0">
          <img
            src={doctor.image_url}
            alt={doctor.name}
            className="w-32 h-32 rounded-xl object-cover border-4 border-indigo-100 shadow-md"
          />
          <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-400 rounded-full border-3 border-white shadow-sm"></div>
        </div>

        {/* Doctor Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{doctor.name}</h3>
              <span className="inline-block px-4 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                {doctor.specialty}
              </span>
            </div>
            <button
              onClick={() => onToggleFavorite(doctor.id)}
              className="text-2xl transition-transform hover:scale-125"
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
          </div>

          {doctor.experience_years && (
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span>{doctor.experience_years} năm kinh nghiệm</span>
            </div>
          )}

          {doctor.education && (
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              <span>{doctor.education}</span>
            </div>
          )}

          {doctor.bio && (
            <p className="text-gray-600 mb-4 line-clamp-2">{doctor.bio}</p>
          )}

          <button
            onClick={() => onBooking(doctor)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2"
          >
            Đặt lịch khám
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}