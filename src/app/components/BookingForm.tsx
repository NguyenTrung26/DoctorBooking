'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface Doctor {
  id: string
  name: string
  specialty?: string
}

interface Appointment {
  id: string
  appointment_date: string
  notes: string
  doctor: Doctor
}

export default function BookingPage() {
  const searchParams = useSearchParams()
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [appointmentDate, setAppointmentDate] = useState('')
  const [notes, setNotes] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [calendarValue, setCalendarValue] = useState<Date | null>(new Date())

  // Lấy user hiện tại và danh sách lịch hẹn
  useEffect(() => {
    const fetchUserAndAppointments = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setUserId(null)
        setLoading(false)
        return
      }
      setUserId(user.id)

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          notes,
          doctor:doctor_id ( id, name, specialty )
        `)
        .eq('user_id', user.id)
        .order('appointment_date', { ascending: true })

      if (error) console.error(error)
      else
        setAppointments(
          (data || []).map((appt: any) => ({
            id: appt.id,
            appointment_date: appt.appointment_date,
            notes: appt.notes,
            doctor: appt.doctor?.[0] || { id: '', name: '', specialty: '' }
          }))
        )
      
      setLoading(false)
    }

    fetchUserAndAppointments()
  }, [])

  // Lấy doctor từ query
  useEffect(() => {
    const doctorId = searchParams.get('doctor_id')
    const doctorName = searchParams.get('doctor_name')
    if (doctorId && doctorName) {
      setSelectedDoctor({ id: doctorId, name: doctorName })
    }
  }, [searchParams])

  const addAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !selectedDoctor) {
      toast.error('Bạn phải chọn bác sĩ và đăng nhập!')
      return
    }

    const { data, error } = await supabase.from('appointments').insert([
      {
        user_id: userId,
        doctor_id: selectedDoctor.id,
        appointment_date: appointmentDate,
        notes
      }
    ]).select(`
      id,
      appointment_date,
      notes,
      doctor:doctor_id ( id, name, specialty )
    `)

    if (!error && data) {
      toast.success('Đặt lịch thành công!')
      setAppointmentDate('')
      setNotes('')
      const newAppt = {
        id: data[0].id,
        appointment_date: data[0].appointment_date,
        notes: data[0].notes,
        doctor: data[0].doctor?.[0] || { id: '', name: '', specialty: '' }
      }
      setAppointments(prev => [...prev, newAppt])
    } else {
      toast.error('Đặt lịch thất bại!')
      console.error(error)
    }
  }

  if (loading) return <p className="text-center mt-10">Đang tải...</p>
  if (!userId) return <p className="text-center mt-10 text-red-500">Vui lòng đăng nhập để đặt và xem lịch hẹn.</p>

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />

      <h2 className="text-3xl font-bold mb-6 text-indigo-800">Đặt lịch mới</h2>

      {/* Form đặt lịch */}
      <form onSubmit={addAppointment} className="space-y-4">
        <label className="block text-gray-700 font-semibold">Bác sĩ</label>
        {selectedDoctor ? (
          <input
            type="text"
            value={selectedDoctor.name}
            className="border p-2 w-full rounded bg-gray-100 text-black"
            readOnly
          />
        ) : (
          <p className="text-red-500">Vui lòng chọn bác sĩ từ trang danh sách</p>
        )}

        <label className="block text-gray-700 font-semibold">Ngày hẹn</label>
        <input
          type="date"
          value={appointmentDate}
          onChange={(e) => setAppointmentDate(e.target.value)}
          className="border p-2 w-full rounded text-black"
          required
        />

        <label className="block text-gray-700 font-semibold">Ghi chú</label>
        <textarea
          placeholder="Ghi chú"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="border p-2 w-full rounded text-black"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Đặt lịch
        </button>
      </form>

      {/* Calendar + Danh sách */}
      <div className="mt-10 md:flex md:space-x-6">
        {/* Calendar */}
        <div className="md:w-1/2">
          <h3 className="text-2xl font-bold mb-4 text-indigo-800">Lịch hẹn trực quan</h3>
          <Calendar
            onChange={(date) => setCalendarValue(date as Date)}
            value={calendarValue}
            tileClassName={({ date, view }) => {
              if (view === 'month') {
                const dateStr = date.toISOString().split('T')[0]
                if (appointments.some(a => a.appointment_date === dateStr)) {
                  return 'bg-blue-500 text-white rounded-full'
                }
              }
              return ''
            }}
          />
        </div>

        {/* Danh sách */}
        <div className="md:w-1/2 mt-6 md:mt-0">
          <h3 className="text-2xl font-bold mb-4 text-indigo-800">Danh sách lịch hẹn</h3>
          {appointments.length === 0 ? (
            <p className="text-gray-500">Bạn chưa có lịch hẹn nào.</p>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {appointments.map((appt) => (
                <div key={appt.id} className="border p-4 rounded-lg shadow hover:shadow-lg transition">
                  <p className="font-semibold text-lg text-indigo-900">{appt.doctor.name}</p>
                  {appt.doctor.specialty && <p className="text-gray-700">{appt.doctor.specialty}</p>}
                  <p className="text-gray-600">Ngày hẹn: {appt.appointment_date}</p>
                  {appt.notes && <p className="text-gray-600">Ghi chú: {appt.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
