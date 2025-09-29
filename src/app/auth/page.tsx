'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      setErrorMsg(error.message)
    } else {
      setErrorMsg('')
      router.push('/booking')
    }
  }

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) setErrorMsg(error.message)
    else setErrorMsg('Tạo tài khoản thành công! Bạn có thể đăng nhập.')
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow rounded p-6">
      <h1 className="text-black text-2xl font-bold mb-6">Đăng nhập / Đăng ký</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="text-black border w-full p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="text-black border w-full p-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-black px-4 py-2 rounded w-full"
        >
          Đăng nhập
        </button>
      </form>
      <button
        onClick={handleSignup}
        className="mt-4 w-full bg-gray-200 text-black hover:bg-gray-300 px-4 py-2 rounded"
      >
        Tạo tài khoản mới
      </button>
      {errorMsg && <p className="text-red-500 mt-2 text-center">{errorMsg}</p>}
    </div>
  )
}
