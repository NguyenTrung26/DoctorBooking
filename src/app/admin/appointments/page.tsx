'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Appointment {
  id: string
  appointment_date: string
  notes: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  user: { email: string; full_name?: string }
  doctor: { name: string; specialty?: string }
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAdminAndFetch()
  }, [])

  const checkAdminAndFetch = async () => {
    try {
      console.log('🔍 Checking admin status...')
      const { data: { user } } = await supabase.auth.getUser()
      
      console.log('👤 Current user:', user)
      
      if (!user) {
        console.log('❌ No user logged in')
        alert('⚠️ Vui lòng đăng nhập!')
        setLoading(false)
        return
      }

      // Kiểm tra xem user có phải admin không
      console.log('🔍 Checking if user is admin...')
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single()

      console.log('Admin check result:', { adminData, adminError })

      if (adminError || !adminData) {
        console.log('❌ User is not admin')
        alert('🚫 Bạn không có quyền truy cập trang này!')
        setIsAdmin(false)
        setLoading(false)
        return
      }

      console.log('✅ User is admin!')
      setIsAdmin(true)
      await fetchAppointments()
    } catch (error) {
      console.error('❌ Error checking admin:', error)
      setLoading(false)
    }
  }

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      console.log('📋 Fetching appointments...')
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          notes,
          status,
          user_id,
          doctor_id
        `)
        .order('appointment_date', { ascending: true })

      console.log('Appointments query result:', { data, error })

      if (error) {
        console.error('❌ Error fetching appointments:', error)
        alert('Lỗi: ' + error.message)
        return
      }

      if (!data || data.length === 0) {
        console.log('⚠️ No appointments found')
        setAppointments([])
        return
      }

      console.log(`✅ Found ${data.length} appointments`)

      // Fetch profiles và doctors
      const userIds = [...new Set(data?.map(a => a.user_id) || [])]
      const doctorIds = [...new Set(data?.map(a => a.doctor_id) || [])]

      console.log('Fetching profiles for:', userIds)
      console.log('Fetching doctors for:', doctorIds)

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds)

      const { data: doctors, error: doctorsError } = await supabase
        .from('doctors')
        .select('id, name, specialty')
        .in('id', doctorIds)

      console.log('Profiles:', { profiles, profilesError })
      console.log('Doctors:', { doctors, doctorsError })

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || [])
      const doctorsMap = new Map(doctors?.map(d => [d.id, d]) || [])

      const formattedData = (data || []).map((appt: any) => {
        const profile = profilesMap.get(appt.user_id)
        return {
          id: appt.id,
          appointment_date: appt.appointment_date,
          notes: appt.notes,
          status: appt.status || 'pending',
          user: { 
            email: profile?.email || appt.user_id.slice(0, 8) + '...',
            full_name: profile?.full_name
          },
          doctor: doctorsMap.get(appt.doctor_id) || { name: 'N/A' }
        }
      })

      console.log('✅ Formatted data:', formattedData)
      setAppointments(formattedData)
    } catch (error) {
      console.error('❌ Unexpected error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      console.log(`🔄 Updating appointment ${id} to status: ${newStatus}`)
      
      // Đảm bảo status là lowercase (pending, approved, rejected)
      const normalizedStatus = newStatus.toLowerCase()
      
      const { data, error } = await supabase
        .from('appointments')
        .update({ status: normalizedStatus })
        .eq('id', id)
        .select()

      console.log('Update result:', { data, error })

      if (error) {
        console.error('❌ Update error:', error)
        alert('Lỗi cập nhật: ' + error.message)
        return
      }

      console.log('✅ Update successful!')
      alert('✅ Cập nhật thành công!')
      await fetchAppointments()
    } catch (error) {
      console.error('❌ Unexpected error:', error)
      alert('Có lỗi xảy ra: ' + JSON.stringify(error))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-red-800 mb-2">Truy cập bị từ chối</h2>
          <p className="text-red-600">Bạn không có quyền truy cập trang quản trị này.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🏥 Quản lý lịch hẹn
        </h1>
        <div className="flex gap-4 text-sm">
          <span className="text-gray-600">
            Tổng: <strong className="text-indigo-600">{appointments.length}</strong>
          </span>
          <span className="text-yellow-600">
            Chờ xác nhận: <strong>{appointments.filter(a => a.status === 'pending').length}</strong>
          </span>
          <span className="text-green-600">
            Đã xác nhận: <strong>{appointments.filter(a => a.status === 'confirmed').length}</strong>
          </span>
          <span className="text-blue-600">
            Hoàn thành: <strong>{appointments.filter(a => a.status === 'completed').length}</strong>
          </span>
          <span className="text-red-600">
            Đã hủy: <strong>{appointments.filter(a => a.status === 'cancelled').length}</strong>
          </span>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500 text-lg">Chưa có lịch hẹn nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Ngày hẹn</th>
                  <th className="px-6 py-4 text-left font-semibold">Bệnh nhân</th>
                  <th className="px-6 py-4 text-left font-semibold">Bác sĩ</th>
                  <th className="px-6 py-4 text-left font-semibold">Ghi chú</th>
                  <th className="px-6 py-4 text-left font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 text-left font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {appt.appointment_date}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {appt.user?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {appt.doctor?.name || 'N/A'}
                        </p>
                        {appt.doctor?.specialty && (
                          <p className="text-sm text-gray-500">
                            {appt.doctor.specialty}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                      {appt.notes || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={appt.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {appt.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(appt.id, 'confirmed')}
                              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium"
                            >
                              ✓ Xác nhận
                            </button>
                            <button
                              onClick={() => updateStatus(appt.id, 'cancelled')}
                              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
                            >
                              ✗ Hủy
                            </button>
                          </>
                        )}
                        {appt.status === 'confirmed' && (
                          <button
                            onClick={() => updateStatus(appt.id, 'completed')}
                            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
                          >
                            ✔️ Hoàn thành
                          </button>
                        )}
                        {(appt.status === 'cancelled' || appt.status === 'completed') && (
                          <span className="text-gray-400 text-sm">Không có hành động</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    confirmed: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
    completed: 'bg-blue-100 text-blue-800 border-blue-300'
  }

  const labels = {
    pending: '⏳ Chờ xác nhận',
    confirmed: '✅ Đã xác nhận',
    cancelled: '❌ Đã hủy',
    completed: '✔️ Hoàn thành'
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${styles[status as keyof typeof styles] || styles.pending}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  )
}