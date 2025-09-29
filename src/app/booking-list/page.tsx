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
  doctor: Doctor;
}

export default function BookingListPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [calendarValue, setCalendarValue] = useState<Date | null>(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
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
          doctor:doctor_id ( id, name, specialty )
        `
        )
        .eq("user_id", user.id)
        .order("appointment_date", { ascending: true });

      if (error) console.error(error);
      else
        setAppointments(
          (data || []).map((appt: any) => ({
            id: appt.id,
            appointment_date: appt.appointment_date,
            notes: appt.notes,
            doctor: appt.doctor?.[0] || { id: "", name: "", specialty: "" },
          }))
        );

      setLoading(false);
    };

    fetchUserAndAppointments();
  }, []);

  if (loading) return <p className="text-center mt-10">Đang tải...</p>;
  if (!userId)
    return (
      <p className="text-center mt-10 text-red-500">
        Vui lòng đăng nhập để xem lịch hẹn.
      </p>
    );

  const appointmentDatesSet = new Set(
    appointments.map((a) => a.appointment_date)
  );

  // Lọc appointments theo ngày được chọn
  const filteredAppointments = selectedDate
    ? appointments.filter((a) => a.appointment_date === selectedDate)
    : appointments;

  const handleDateClick = (value: Date | null) => {
    if (!value) return;
    // Sử dụng local date thay vì UTC để tránh lệch múi giờ
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    setCalendarValue(value);
    setSelectedDate(appointmentDatesSet.has(dateStr) ? dateStr : null);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-indigo-800 mb-8">
        Lịch hẹn của bạn
      </h2>

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
            .react-calendar__navigation button {
              font-size: 1.1em;
              font-weight: 600;
            }
            .react-calendar__navigation button:enabled:hover,
            .react-calendar__navigation button:enabled:focus {
              background-color: #e0e7ff;
            }
            .react-calendar__month-view__weekdays {
              font-weight: 600;
              color: #4b5563;
            }
          `}</style>
          <Calendar
            onChange={(value) => {
              if (Array.isArray(value)) handleDateClick(value[0]);
              else if (value) handleDateClick(value);
            }}
            value={calendarValue}
            tileClassName={({ date, view }) => {
              // Sử dụng local date để so sánh
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
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-200"></div>
              <span>Có lịch hẹn</span>
            </div>
          </div>
        </div>

        {/* Appointments List Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            {selectedDate
              ? `Lịch hẹn ngày ${selectedDate}`
              : "Tất cả lịch hẹn"}
          </h3>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="text-sm text-indigo-600 hover:text-indigo-800 mb-4"
            >
              ← Xem tất cả
            </button>
          )}
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
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
                  className="border-l-4 border-indigo-500 bg-gradient-to-r from-indigo-50 to-white p-4 rounded-lg shadow hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-lg text-indigo-900">
                        {appt.doctor.name}
                      </p>
                      {appt.doctor.specialty && (
                        <p className="text-sm text-gray-600 mt-1">
                          {appt.doctor.specialty}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-medium text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
                      {appt.appointment_date}
                    </span>
                  </div>
                  {appt.notes && (
                    <p className="text-gray-600 mt-3 text-sm bg-gray-50 p-2 rounded">
                      📝 {appt.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}