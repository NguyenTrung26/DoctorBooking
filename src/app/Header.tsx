'use client'

import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function Header() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="bg-blue-600 text-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">DoctorBooking</h1>
        <nav className="space-x-4">
          <Link href="/" className="hover:underline">
            Trang chủ
          </Link>
          <Link href="/booking" className="hover:underline">
            Đặt lịch
          </Link>
          <Link href="/booking-list" className="hover:underline">
            Lịch hẹn
          </Link>
          {!user ? (
            <Link href="/auth" className="hover:underline">
              Đăng nhập
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-200"
            >
              Đăng xuất
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
