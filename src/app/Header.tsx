'use client'

import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      // Kiểm tra xem user có phải admin không
      if (user) {
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        setIsAdmin(!!adminData);
      }
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        
        // Kiểm tra admin khi auth state thay đổi
        if (session?.user) {
          const { data: adminData } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          setIsAdmin(!!adminData);
        } else {
          setIsAdmin(false);
        }
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setIsAdmin(false);
    window.location.href = "/";
  }

  return (
    <header className="bg-blue-600 text-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-2xl font-bold cursor-pointer hover:text-yellow-300 transition">
            DoctorBooking
          </h1>
        </Link>
        
        <nav className="flex items-center space-x-4">
          <Link href="/" className="hover:underline hover:text-yellow-300 transition">
            Trang chủ
          </Link>
          <Link href="/booking" className="hover:underline hover:text-yellow-300 transition">
            Đặt lịch
          </Link>
          <Link href="/booking-list" className="hover:underline hover:text-yellow-300 transition">
            Lịch hẹn
          </Link>
          
          {/* Hiển thị link Admin nếu là admin */}
          {isAdmin && (
            <Link 
              href="/admin/appointments" 
              className="bg-yellow-400 text-blue-900 px-3 py-1 rounded font-semibold hover:bg-yellow-300 transition flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Quản trị
            </Link>
          )}
          
          {!user ? (
            <Link href="/auth" className="hover:underline hover:text-yellow-300 transition">
              Đăng nhập
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm bg-blue-700 px-3 py-1 rounded">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-200 transition font-medium"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}