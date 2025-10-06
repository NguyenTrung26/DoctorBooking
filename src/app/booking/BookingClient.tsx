'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type Doctor = {
  id: string
  name: string
  specialization: string
}

type Booking = {
  id: string
  patient_name: string
  date: string
  time: string
}

export default function BookingClient() {
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [patientName, setPatientName] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [loading, setLoading] = useState(false)

  const searchParams = useSearchParams()
  const doctorId = searchParams.get("doctorId")

  useEffect(() => {
    if (!doctorId) return

    const fetchDoctorAndBookings = async () => {
      // Lấy thông tin bác sĩ
      const { data: doctorData, error: doctorError } = await supabase
        .from("doctors")
        .select("*")
        .eq("id", doctorId)
        .single()

      if (doctorError) {
        console.error("Error fetching doctor:", doctorError.message)
      } else {
        setDoctor(doctorData)
      }

      // Lấy danh sách lịch hẹn
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
        .eq("doctor_id", doctorId)
        .order("date", { ascending: true })
        .order("time", { ascending: true })

      if (bookingsError) {
        console.error("Error fetching bookings:", bookingsError.message)
      } else {
        setBookings(bookingsData || [])
      }
    }

    fetchDoctorAndBookings()
  }, [doctorId])

  const handleBooking = async () => {
    if (!doctorId || !patientName || !date || !time) {
      alert("Vui lòng điền đầy đủ thông tin.")
      return
    }

    setLoading(true)
    const { error } = await supabase.from("bookings").insert([
      {
        doctor_id: doctorId,
        patient_name: patientName,
        date,
        time,
      },
    ])

    if (error) {
      console.error("Error booking appointment:", error.message)
      alert("Có lỗi xảy ra, vui lòng thử lại.")
    } else {
      alert("Đặt lịch thành công!")
      setPatientName("")
      setDate("")
      setTime("")

      // Reload danh sách lịch hẹn
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("*")
        .eq("doctor_id", doctorId)
        .order("date", { ascending: true })
        .order("time", { ascending: true })

      setBookings(bookingsData || [])
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-lg">
      {doctor ? (
        <>
          <h1 className="text-2xl font-bold mb-4">
            Đặt lịch với bác sĩ {doctor.name} ({doctor.specialization})
          </h1>

          <div className="space-y-4 mb-6">
            <input
              type="text"
              placeholder="Tên bệnh nhân"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <button
              onClick={handleBooking}
              disabled={loading}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Đặt lịch"}
            </button>
          </div>

          <h2 className="text-xl font-semibold mb-2">Danh sách lịch đã đặt</h2>
          <ul className="space-y-2">
            {bookings.map((b) => (
              <li key={b.id} className="p-2 border rounded">
                {b.date} - {b.time}: {b.patient_name}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Đang tải thông tin bác sĩ...</p>
      )}
    </div>
  )
}
