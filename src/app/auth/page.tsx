'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setErrorMsg(error.message)
    } else {
      setSuccessMsg('Đăng nhập thành công!')
      setTimeout(() => router.push('/'), 1000)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    // Validation
    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp!')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự!')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phoneNumber,
        }
      }
    })

    setLoading(false)

    if (error) {
      setErrorMsg(error.message)
    } else {
      setSuccessMsg('Tạo tài khoản thành công! Vui lòng kiểm tra email để xác nhận tài khoản.')
      // Reset form
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setFullName('')
      setPhoneNumber('')
      
      // Chuyển sang tab đăng nhập sau 3s
      setTimeout(() => setIsLogin(true), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-indigo-600 rounded-full mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            {isLogin ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Đăng nhập để tiếp tục' : 'Điền thông tin để đăng ký'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setIsLogin(true)
                setErrorMsg('')
                setSuccessMsg('')
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                isLogin
                  ? 'bg-white text-indigo-600 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => {
                setIsLogin(false)
                setErrorMsg('')
                setSuccessMsg('')
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                !isLogin
                  ? 'bg-white text-indigo-600 shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Đăng ký
            </button>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 text-sm">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-700 text-sm">{successMsg}</p>
            </div>
          )}

          {/* Login Form */}
          {isLogin && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Đang xử lý...
                  </span>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </form>
          )}

          {/* Signup Form */}
          {!isLogin && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  placeholder="0123456789"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Đang xử lý...
                  </span>
                ) : (
                  'Tạo tài khoản'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? (
            <p>
              Chưa có tài khoản?{' '}
              <button
                onClick={() => setIsLogin(false)}
                className="text-indigo-600 font-semibold hover:text-indigo-800 transition"
              >
                Đăng ký ngay
              </button>
            </p>
          ) : (
            <p>
              Đã có tài khoản?{' '}
              <button
                onClick={() => setIsLogin(true)}
                className="text-indigo-600 font-semibold hover:text-indigo-800 transition"
              >
                Đăng nhập
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}