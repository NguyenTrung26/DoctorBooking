"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image_url: string;
}

export function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [favorites, setFavorites] = useState<
    { id: string; doctor_id: string }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDoctors = async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .order("name");
      if (!error && data) setDoctors(data);
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userId) return;
      const { data } = await supabase
        .from("users_favorites")
        .select("*")
        .eq("user_id", userId);
      setFavorites(data || []);
    };
    fetchFavorites();
  }, [userId]);

  const toggleFavorite = async (doctorId: string) => {
    if (!userId) return alert("Bạn cần đăng nhập!");
    const favorite = favorites.find((f) => f.doctor_id === doctorId);
    if (favorite) {
      await supabase.from("users_favorites").delete().eq("id", favorite.id);
    } else {
      await supabase
        .from("users_favorites")
        .insert({ user_id: userId, doctor_id: doctorId });
    }
    const { data } = await supabase
      .from("users_favorites")
      .select("*")
      .eq("user_id", userId);
    setFavorites(data || []);
  };

  const handleBooking = (doctor: Doctor) => {
    router.push(
      `/booking?doctor_id=${doctor.id}&doctor_name=${encodeURIComponent(
        doctor.name
      )}`
    );
  };

  const specialties = Array.from(new Set(doctors.map((d) => d.specialty)));
  const filteredDoctors = doctors
    .filter((d) =>
      selectedSpecialty ? d.specialty === selectedSpecialty : true
    )
    .filter((d) => d.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <section className="py-20 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Đội ngũ bác sĩ chuyên môn
          </h2>
          <p className="text-gray-600 text-lg">
            Kết nối với những chuyên gia y tế hàng đầu
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Tìm kiếm bác sĩ theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 pr-12 border-2 border-gray-200 rounded-full text-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none shadow-sm"
            />
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Specialty Tabs */}
        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          <button
            className={`px-6 py-2.5 rounded-full font-semibold transition-all shadow-sm
              ${
                selectedSpecialty === ""
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }
            `}
            onClick={() => setSelectedSpecialty("")}
          >
            Tất cả
          </button>
          {specialties.map((s) => (
            <button
              key={s}
              className={`px-6 py-2.5 rounded-full font-semibold transition-all shadow-sm
                ${
                  selectedSpecialty === s
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }
              `}
              onClick={() => setSelectedSpecialty(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Doctor Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDoctors.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">
                Không tìm thấy bác sĩ phù hợp
              </p>
            </div>
          )}
          {filteredDoctors.map((doc, idx) => (
            <DoctorCard
              key={doc.id}
              doctor={doc}
              onBooking={handleBooking}
              onToggleFavorite={toggleFavorite}
              isFavorite={favorites.some((f) => f.doctor_id === doc.id)}
              index={idx}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function DoctorCard({
  doctor,
  onBooking,
  onToggleFavorite,
  isFavorite,
  index,
}: {
  doctor: Doctor;
  onBooking: (doc: Doctor) => void;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );
    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`group relative bg-white rounded-2xl p-6 text-center transition-all duration-700 ease-out shadow-lg
        ${isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}
        hover:-translate-y-2 hover:shadow-2xl
      `}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      {/* Favorite Button */}
      <button
        onClick={() => onToggleFavorite(doctor.id)}
        className="absolute top-4 right-4 text-2xl transition-transform hover:scale-125 z-10"
        aria-label="Toggle favorite"
      >
        {isFavorite ? "❤️" : "🤍"}
      </button>

      {/* Doctor Image */}
      <div className="relative inline-block mb-6">
        <Image
          src={doctor.image_url}
          alt={doctor.name}
          width={128}
          height={128}
          className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-indigo-100 shadow-md group-hover:border-indigo-300 transition-all"
        />
        <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-400 rounded-full border-3 border-white shadow-sm"></div>
      </div>

      {/* Doctor Info */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">{doctor.name}</h3>
      <div className="inline-block px-4 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium mb-6">
        {doctor.specialty}
      </div>

      {/* Action Button */}
      <button
        onClick={() => onBooking(doctor)}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 group-hover:from-indigo-700 group-hover:to-purple-700"
      >
        <span className="flex items-center justify-center gap-2">
          Đặt lịch khám
          <svg
            className="w-4 h-4 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </span>
      </button>
    </div>
  );
}

// Default export for backward compatibility
export default Doctors;
