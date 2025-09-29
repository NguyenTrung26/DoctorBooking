'use client'
import useInViewAnimation from './useInViewAnimation'

interface Testimonial {
  id: number
  name: string
  text: string
  avatar: string
  rating: number
  role: string
}

export function Testimonials() {
  const testimonials: Testimonial[] = [
    { 
      id: 1, 
      name: 'Nguyễn Văn An', 
      text: 'Đặt lịch cực kỳ nhanh chóng và tiện lợi. Bác sĩ rất nhiệt tình, tận tâm với bệnh nhân!', 
      avatar: '/avatars/user1.jpg',
      rating: 5,
      role: 'Bệnh nhân'
    },
    { 
      id: 2, 
      name: 'Trần Thị Bích', 
      text: 'Giao diện đẹp mắt, dễ sử dụng. Tôi đã giới thiệu cho nhiều người thân sử dụng.', 
      avatar: '/avatars/user2.jpg',
      rating: 5,
      role: 'Bệnh nhân'
    },
    { 
      id: 3, 
      name: 'Lê Minh Công', 
      text: 'Quản lý lịch hẹn rất tiện, không bao giờ quên lịch khám nữa. Rất hài lòng!', 
      avatar: '/avatars/user3.jpg',
      rating: 5,
      role: 'Bệnh nhân'
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-indigo-50 via-purple-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Khách hàng nói gì về chúng tôi
          </h2>
          <p className="text-gray-600 text-lg">Hàng ngàn người dùng tin tưởng và hài lòng</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => {
            const { ref, isVisible } = useInViewAnimation()
            return (
              <div
                key={t.id}
                ref={ref}
                className={`bg-white rounded-2xl p-8 shadow-lg transition-all duration-700 ease-out relative
                  ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}
                  hover:-translate-y-2 hover:shadow-2xl
                `}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                {/* Quote icon */}
                <div className="absolute top-6 right-6 text-5xl text-indigo-100">"</div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <img 
                      src={t.avatar} 
                      alt={t.name} 
                      className="w-16 h-16 rounded-full object-cover border-3 border-indigo-200 shadow-md" 
                    />
                    <div className="absolute -bottom-1 -right-1 bg-green-400 w-4 h-4 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{t.name}</h3>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>

                <p className="text-gray-700 leading-relaxed italic">"{t.text}"</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}