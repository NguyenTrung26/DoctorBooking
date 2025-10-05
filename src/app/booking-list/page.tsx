"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface Doctor {
  id: string;
  name: string;
  specialty?: string;
}

interface Appointment {
  id: string;
  appointment_date: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  cancellation_reason?: string;
  cancelled_at?: string;
  confirmed_at?: string;
  completed_at?: string;
  created_at: string;
  doctor: Doctor;
}

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed';

export default function BookingListPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [calendarValue, setCalendarValue] = useState<Date | null>(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  
  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [newDate, setNewDate] = useState('');

  useEffect(() => {
    fetchUserAndAppointments();
  }, []);

  const fetchUserAndAppointments = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUserId(null);
      setLoading(false);
      return;
    }

    setUserId(user.id);

    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        id,
        appointment_date,
        notes,
        status,
        cancellation_reason,
        cancelled_at,
        confirmed_at,
        completed_at,
        created_at,
        doctor:doctor_id ( id, name, specialty )
      `
      )
      .eq("user_id", user.id)
      .order("appointment_date", { ascending: false });

    if (error) console.error(error);
    else
      setAppointments(
        (data || []).map((appt: any) => ({
          id: appt.id,
          appointment_date: appt.appointment_date,
          notes: appt.notes,
          status: appt.status,
          cancellation_reason: appt.cancellation_reason,
          cancelled_at: appt.cancelled_at,
          confirmed_at: appt.confirmed_at,
          completed_at: appt.completed_at,
          created_at: appt.created_at,
          doctor: appt.doctor?.[0] || { id: "", name: "", specialty: "" },
        }))
      );

    setLoading(false);
  };

  // Cancel appointment
  const handleCancelAppointment = async () => {
    if (!selectedAppointment || !cancellationReason.trim()) {
      alert('Vui lòng nhập lý do hủy!');
      return;
    }

    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancellation_reason: cancellationReason,
        cancelled_at: new Date().toISOString()
      })
      .eq('id', selectedAppointment.id);

    if (!error) {
      // Log history
      await supabase.from('appointment_history').insert({
        appointment_id: selectedAppointment.id,
        old_status: selectedAppointment.status,
        new_status: 'cancelled',
        old_date: selectedAppointment.appointment_date,
        new_date: selectedAppointment.appointment_date,
        changed_by: userId,
        reason: cancellationReason
      });

      alert('✅ Đã hủy lịch hẹn thành công!');
      setShowCancelModal(false);
      setCancellationReason('');
      setSelectedAppointment(null);
      fetchUserAndAppointments();
    } else {
      alert('❌ Có lỗi xảy ra!');
    }
  };

  // Reschedule appointment
  const handleRescheduleAppointment = async () => {
    if (!selectedAppointment || !newDate) {
      alert('Vui lòng chọn ngày mới!');
      return;
    }

    const { error } = await supabase
      .from('appointments')
      .update({
        appointment_date: newDate,
        status: 'pending' // Reset về pending khi đổi lịch
      })
      .eq('id', selectedAppointment.id);

    if (!error) {
      // Log history
      await supabase.from('appointment_history').insert({
        appointment_id: selectedAppointment.id,
        old_status: selectedAppointment.status,
        new_status: 'pending',
        old_date: selectedAppointment.appointment_date,
        new_date: newDate,
        changed_by: userId,
        reason: 'Reschedule appointment'
      });

      alert('✅ Đã đổi lịch hẹn thành công!');
      setShowRescheduleModal(false);
      setNewDate('');
      setSelectedAppointment(null);
      fetchUserAndAppointments();
    } else {
      alert('❌ Có lỗi xảy ra!');
    }
  };

  if (loading) return <p className="text-center mt-10">Đang tải...</p>;
  if (!userId)
    return (
      <p className="text-center mt-10 text-red-500">
        Vui lòng đăng nhập để xem lịch hẹn.
      </p>
    );

  const appointmentDatesSet = new Set(
    appointments
      .filter(a => a.status !== 'cancelled')
      .map((a) => a.appointment_date)
  );

  // Filter appointments
  let filteredAppointments = selectedDate
    ? appointments.filter((a) => a.appointment_date === selectedDate)
    : appointments;

  if (statusFilter !== 'all') {
    filteredAppointments = filteredAppointments.filter(a => a.status === statusFilter);
  }

  const handleDateClick = (value: Date | null) => {
    if (!value) return;
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    setCalendarValue(value);
    setSelectedDate(appointmentDatesSet.has(dateStr) ? dateStr : null);
  };

  // Get counts for each status
  const statusCounts = {
    all: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '⏳', text: 'Chờ xác nhận' },
      confirmed: { color: 'bg-green-100 text-green-800 border-green-300', icon: '✅', text: 'Đã xác nhận' },
      cancelled: { color: 'bg-red-100 text-red-800 border-red-300', icon: '❌', text: 'Đã hủy' },
      completed: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: '✔️', text: 'Hoàn thành' },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
        <span>{badge.icon}</span>
        {badge.text}
      </span>
    );
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-indigo-800 mb-8">
        Quản lý lịch hẹn
      </h2>

      {/* Status Filter Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as StatusFilter[]).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === status
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' && `Tất cả (${statusCounts.all})`}
              {status === 'pending' && `⏳ Chờ xác nhận (${statusCounts.pending})`}
              {status === 'confirmed' && `✅ Đã xác nhận (${statusCounts.confirmed})`}
              {status === 'completed' && `✔️ Hoàn thành (${statusCounts.completed})`}
              {status === 'cancelled' && `❌ Đã hủy (${statusCounts.cancelled})`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Lịch khám
          </h3>
          <style jsx global>{`
            .react-calendar {
              width: 100%;
              border: none;
              font-family: inherit;
            }
            .react-calendar__tile {
              padding: 1em 0.5em;
              position: relative;
            }
            .react-calendar__tile--active {
              background: #4f46e5;
              color: white;
            }
            .react-calendar__tile--active:enabled:hover,
            .react-calendar__tile--active:enabled:focus {
              background: #4338ca;
            }
            .appointment-day {
              background: #dbeafe !important;
              font-weight: bold;
              color: #1e40af;
            }
            .appointment-day:hover {
              background: #bfdbfe !important;
            }
            .appointment-day::after {
              content: "•";
              position: absolute;
              bottom: 2px;
              left: 50%;
              transform: translateX(-50%);
              color: #3b82f6;
              font-size: 20px;
            }
          `}</style>
          <Calendar
            onChange={(value) => {
              if (Array.isArray(value)) handleDateClick(value[0]);
              else if (value) handleDateClick(value);
            }}
            value={calendarValue}
            tileClassName={({ date, view }) => {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              const dateStr = `${year}-${month}-${day}`;
              if (view === "month" && appointmentDatesSet.has(dateStr)) {
                return "appointment-day";
              }
              return "";
            }}
          />
        </div>

        {/* Appointments List Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            {selectedDate
              ? `Lịch hẹn ngày ${selectedDate}`
              : "Danh sách lịch hẹn"}
          </h3>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="text-sm text-indigo-600 hover:text-indigo-800 mb-4"
            >
              ← Xem tất cả
            </button>
          )}
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {filteredAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {selectedDate
                  ? "Không có lịch hẹn nào trong ngày này."
                  : "Bạn chưa có lịch hẹn nào."}
              </p>
            ) : (
              filteredAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className={`border-l-4 p-4 rounded-lg shadow hover:shadow-md transition ${
                    appt.status === 'confirmed' ? 'border-green-500 bg-green-50' :
                    appt.status === 'cancelled' ? 'border-red-500 bg-red-50' :
                    appt.status === 'completed' ? 'border-blue-500 bg-blue-50' :
                    'border-yellow-500 bg-yellow-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-lg text-gray-900">
                        {appt.doctor.name}
                      </p>
                      {appt.doctor.specialty && (
                        <p className="text-sm text-gray-600 mt-1">
                          {appt.doctor.specialty}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(appt.status)}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">{appt.appointment_date}</span>
                  </div>

                  {appt.notes && (
                    <p className="text-gray-600 text-sm bg-white p-2 rounded mb-3">
                      📝 {appt.notes}
                    </p>
                  )}

                  {appt.status === 'cancelled' && appt.cancellation_reason && (
                    <p className="text-red-600 text-sm bg-red-50 p-2 rounded mb-3">
                      ❌ Lý do hủy: {appt.cancellation_reason}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3">
                    {appt.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedAppointment(appt);
                            setNewDate(appt.appointment_date);
                            setShowRescheduleModal(true);
                          }}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
                        >
                          🔄 Đổi lịch
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAppointment(appt);
                            setShowCancelModal(true);
                          }}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
                        >
                          ❌ Hủy lịch
                        </button>
                      </>
                    )}
                    {appt.status === 'confirmed' && appt.appointment_date >= today && (
                      <button
                        onClick={() => {
                          setSelectedAppointment(appt);
                          setShowCancelModal(true);
                        }}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
                      >
                        ❌ Hủy lịch
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              ❌ Xác nhận hủy lịch hẹn
            </h3>
            <p className="text-gray-600 mb-4">
              Bạn có chắc muốn hủy lịch hẹn với <strong>{selectedAppointment?.doctor.name}</strong> vào ngày <strong>{selectedAppointment?.appointment_date}</strong>?
            </p>
            <textarea
              placeholder="Vui lòng nhập lý do hủy lịch..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg p-3 mb-4 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
              rows={4}
              required
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedAppointment(null);
                  setCancellationReason('');
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
              >
                Đóng
              </button>
              <button
                onClick={handleCancelAppointment}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              🔄 Đổi lịch hẹn
            </h3>
            <p className="text-gray-600 mb-4">
              Đổi lịch hẹn với <strong>{selectedAppointment?.doctor.name}</strong>
            </p>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Ngày hiện tại:
              </label>
              <input
                type="date"
                value={selectedAppointment?.appointment_date}
                disabled
                className="w-full border-2 border-gray-200 rounded-lg p-3 bg-gray-100 text-gray-600"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Ngày mới: <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={newDate}
                min={today}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setSelectedAppointment(null);
                  setNewDate('');
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
              >
                Đóng
              </button>
              <button
                onClick={handleRescheduleAppointment}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Xác nhận đổi lịch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}