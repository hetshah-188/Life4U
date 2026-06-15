import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const Testimonials = () => {
  const testimonials = [
    {
      avatar: 'RJ',
      name: 'Rajesh Kumar',
      role: 'Regular Donor • 12 donations',
      text: "I've donated 12 times in 3 years. Getting that SMS that my blood saved a child's life is the best feeling ever!",
      rating: 5
    },
    {
      avatar: 'PS',
      name: 'Priya Sharma',
      role: 'First-time Donor',
      text: 'The process was so smooth! I walked in, donated in 10 minutes, and got juice & cookies. Definitely doing it again.',
      rating: 5
    },
    {
      avatar: 'AP',
      name: 'Arun Patel',
      role: 'Universal Donor • 8 donations',
      text: 'Being O negative, I know my blood is needed in emergencies. It motivates me to donate regularly.',
      rating: 5
    },
    {
      avatar: 'MD',
      name: 'Meera Das',
      role: 'Recipient',
      text: "I needed blood during my surgery. Thanks to donors, I'm alive and healthy today. Forever grateful!",
      rating: 5
    },
    {
      avatar: 'SK',
      name: 'Dr. Sharma',
      role: 'Hospital Director',
      text: "Life4U has reduced our emergency response time by 70%. It's a lifesaving platform for our patients.",
      rating: 5
    }
  ];

  return (
    <section className="py-[100px] px-[30px] bg-linear-to-br from-[#FFF5F5] to-[#F0F7FF] overflow-hidden">
      <div className="text-center max-w-[700px] mx-auto mb-[60px]">
        <span className="section-badge">Stories</span>
        <h2 className="text-3xl md:text-[3rem] font-extrabold mb-5 font-clash text-dark">Real People, <span className="gradient-text">Real Impact</span></h2>
        <p className="text-gray text-lg leading-relaxed">Hear from donors and recipients whose lives changed</p>
      </div>

      <div className="max-w-[1400px] mx-auto mt-10">
        <Swiper
          modules={[Pagination, Navigation, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          loop={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation={true}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
          }}
          className="pb-[60px]"
        >
          {testimonials.map((t, i) => (
            <SwiperSlide key={i}>
              <div className="bg-white rounded-lg p-10 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105">
                <div className="flex items-center gap-5 mb-5">
                  <div className="w-[70px] h-[70px] bg-linear-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-[2rem] text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <h4 className="text-[1.2rem] mb-[5px] font-clash">{t.name}</h4>
                    <p className="text-gray text-sm">{t.role}</p>
                  </div>
                </div>
                <p className="text-[1.1rem] leading-relaxed text-dark mb-5 italic">"{t.text}"</p>
                <div className="text-[#FFD700] text-[1.1rem]">
                  {[...Array(t.rating)].map((_, starIndex) => (
                    <i key={starIndex} className="fas fa-star"></i>
                  ))}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Testimonials;
