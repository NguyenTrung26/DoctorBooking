'use client'
import useInViewAnimation from './useInViewAnimation'

export function Features() {
  const features = [
    { 
      title: 'Đặt lịch nhanh', 
      desc: 'Chỉ cần vài thao tác đơn giản để kết nối với bác sĩ', 
      icon: '⚡',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      title: 'Bác sĩ uy tín', 
      desc: 'Đội ngũ chuyên môn cao, tận tâm với bệnh nhân', 
      icon: '🩺',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      title: 'Quản lý thông minh', 
      desc: 'Theo dõi lịch hẹn và lịch sử khám mọi lúc mọi nơi', 
      icon: '📱',
      color: 'from-orange-500 to-red-500'
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Vì sao chọn chúng tôi?
          </h2>
          <p className="text-gray-600 text-lg">Trải nghiệm đặt lịch khám hiện đại và tiện lợi</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, idx) => {
            const { ref, isVisible } = useInViewAnimation()
            return (
              <div
                key={idx}
                ref={ref}
                className={`
                  group relative bg-white rounded-2xl p-8 shadow-lg transition-all duration-700 ease-out
                  ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}
                  hover:-translate-y-3 hover:shadow-2xl
                `}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${f.color} rounded-t-2xl`}></div>
                
                <div className={`w-16 h-16 bg-gradient-to-br ${f.color} rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}