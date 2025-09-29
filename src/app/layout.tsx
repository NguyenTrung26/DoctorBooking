// KHÔNG 'use client' ở đây
import './globals.css'
import Header from './Header' // component client
import Footer from './Footer'

export const metadata = {
  title: 'Doctor Booking',
  description: 'Đặt lịch hẹn khám bệnh dễ dàng',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-gray-50 text-gray-800">
        <Header />
        <main className="container mx-auto px-4 py-8 min-h-[80vh]">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
