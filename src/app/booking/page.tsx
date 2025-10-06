'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
export const dynamic = "force-dynamic";

interface Doctor {
  id: string
  name: string
  specialty?: string
}

export default function BookingPage() {
  const searchParams = useSearchParams()
  const doctorIdParam = searchParams.get('doctor_id')

  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [appointmentDate, setAppointmentDate] = useState('')
  const [notes, setNotes] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    fetchUser()
  }, [])

  useEffect(() => {
    const fetchDoctors = async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('name')
      if (!error && data) setDoctors(data)
    }
    fetchDoctors()
  }, [])

  useEffect(() => {
    if (doctorIdParam && doctors.length > 0) {
      const doctor = doctors.find(d => d.id === doctorIdParam) || null
      setSelectedDoctor(doctor)
    }
  }, [doctorIdParam, doctors])

  const addAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) {
      alert('Vui lòng đăng nhập để đặt lịch!')
      return
    }
    if (!selectedDoctor) {
      alert('Vui lòng chọn bác sĩ!')
      return
    }

    setLoading(true)

    const { error } = await supabase
      .from('appointments')
      .insert([
        {
          user_id: userId,
          doctor_id: selectedDoctor.id,
          appointment_date: appointmentDate,
          notes: notes || '',
          status: 'pending' 
        }
      ])

    setLoading(false)

    if (!error) {
      setAppointmentDate('')
      setNotes('')
      setSelectedDoctor(null)
      alert('✅ Đặt lịch thành công!')
    } else {
      console.error(error)
      alert('❌ Có lỗi xảy ra, vui lòng thử lại!')
    }
  }

  // Lấy ngày hiện tại để set min cho input date
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-indigo-100 rounded-full mb-4">
            <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Đặt lịch khám</h1>
          <p className="text-gray-600">Chọn bác sĩ và thời gian phù hợp với bạn</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={addAppointment} className="space-y-6">
            {/* Doctor Selection */}
            <div>
              <label className="flex items-center text-gray-700 font-semibold mb-3">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Chọn bác sĩ
              </label>
              <select
                value={selectedDoctor?.id || ''}
                onChange={(e) => {
                  const doctor = doctors.find(d => d.id === e.target.value) || null
                  setSelectedDoctor(doctor)
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                required
              >
                <option value="">-- Chọn bác sĩ --</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.specialty ? `- ${d.specialty}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Doctor Info */}
            {selectedDoctor && (
              <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                <p className="font-semibold text-indigo-900">{selectedDoctor.name}</p>
                {selectedDoctor.specialty && (
                  <p className="text-sm text-indigo-700 mt-1">{selectedDoctor.specialty}</p>
                )}
              </div>
            )}

            {/* Date Selection */}
            <div>
              <label className="flex items-center text-gray-700 font-semibold mb-3">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Ngày hẹn
              </label>
              <input
                type="date"
                value={appointmentDate}
                min={today}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label className="flex items-center text-gray-700 font-semibold mb-3">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Ghi chú
                <span className="text-gray-400 text-sm font-normal ml-2">(Không bắt buộc)</span>
              </label>
              <textarea
                placeholder="Ví dụ: Tôi muốn tái khám về bệnh tiểu đường..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Xác nhận đặt lịch
                </span>
              )}
            </button>
          </form>

          {/* Info Note */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Lưu ý:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Vui lòng đến trước giờ hẹn 15 phút</li>
                  <li>Mang theo CMND/CCCD và sổ khám bệnh (nếu có)</li>
                  <li>Liên hệ hotline nếu cần hủy/đổi lịch</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}