import React from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const Footer = () => {
  const toast = useToast();
  return (
    <footer className="bg-dark text-white pt-[30px] px-[30px] pb-[20px]">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mb-[30px]">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 text-[1.8rem] font-extrabold font-clash bg-linear-to-br from-primary to-primary-light bg-clip-text text-transparent mb-3 justify-start">
              <i className="fas fa-droplet text-[2rem]"></i>
              <span>Life4U</span>
            </div>
            <p className="text-[#9CA3AF] leading-relaxed mb-4 text-sm">
              Saving lives, one pint at a time. We connect donors with those in need through technology and compassion.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:bg-linear-to-br hover:from-primary hover:to-primary-light hover:-translate-y-0.75" title="Follow us on Instagram"><i className="fab fa-instagram text-xs"></i></a>
              <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:bg-linear-to-br hover:from-primary hover:to-primary-light hover:-translate-y-0.75" title="Like us on Facebook"><i className="fab fa-facebook-f text-xs"></i></a>
              <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:bg-linear-to-br hover:from-primary hover:to-primary-light hover:-translate-y-0.75" title="Follow us on Twitter"><i className="fab fa-twitter text-xs"></i></a>
              <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:bg-linear-to-br hover:from-primary hover:to-primary-light hover:-translate-y-0.75" title="Chat with us on WhatsApp"><i className="fab fa-whatsapp text-xs"></i></a>
              <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:bg-linear-to-br hover:from-primary hover:to-primary-light hover:-translate-y-0.75" title="Subscribe to our YouTube channel"><i className="fab fa-youtube text-xs"></i></a>
            </div>
          </div>

          <div>
            <h4 className="text-[1rem] font-bold mb-3 text-white">Quick Links</h4>
            <ul className="list-none p-0 m-0 text-sm">
              <li className="mb-2"><Link to="/about" className="text-[#9CA3AF] no-underline transition-colors duration-300 hover:text-primary">About Us</Link></li>
              <li className="mb-2"><Link to="/why-donate" className="text-[#9CA3AF] no-underline transition-colors duration-300 hover:text-primary">Why Donate</Link></li>
              <li className="mb-2"><Link to="/become-donor" className="text-[#9CA3AF] no-underline transition-colors duration-300 hover:text-primary">Become a Donor</Link></li>
              <li className="mb-2"><Link to="/contact" className="text-[#9CA3AF] no-underline transition-colors duration-300 hover:text-primary">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[1rem] font-bold mb-3 text-white">For Donors</h4>
            <ul className="list-none p-0 m-0 text-sm">
              <li className="mb-2"><a href="#" className="text-[#9CA3AF] no-underline transition-colors duration-300 hover:text-primary">Donor FAQs</a></li>
              <li className="mb-2"><a href="#" className="text-[#9CA3AF] no-underline transition-colors duration-300 hover:text-primary">Rewards Program</a></li>
              <li className="mb-2"><a href="#" className="text-[#9CA3AF] no-underline transition-colors duration-300 hover:text-primary">Donation Camps</a></li>
              <li className="mb-2"><a href="#" className="text-[#9CA3AF] no-underline transition-colors duration-300 hover:text-primary">Health Tips</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[1rem] font-bold mb-3 text-white">For Patients</h4>
            <ul className="list-none p-0 m-0 text-sm">
              <li className="mb-2"><Link to="/request-blood" className="text-[#9CA3AF] no-underline transition-colors duration-300 hover:text-primary">Request Blood</Link></li>
              <li className="mb-2"><a href="#" className="text-[#9CA3AF] no-underline transition-colors duration-300 hover:text-primary">Find Hospital</a></li>
              <li className="mb-2"><a href="#" className="text-[#9CA3AF] no-underline transition-colors duration-300 hover:text-primary">Emergency Contacts</a></li>
              <li className="mb-2"><a href="#" className="text-[#9CA3AF] no-underline transition-colors duration-300 hover:text-primary">Patient FAQs</a></li>
            </ul>
          </div>

          <div className="md:col-span-5 lg:col-span-1">
            <h4 className="text-[1rem] font-bold mb-3 text-white">Stay Updated</h4>
            <p className="text-[#9CA3AF] mb-3 text-sm">Subscribe for emergency alerts and updates</p>
            <form className="flex gap-[10px]" onSubmit={(e) => { e.preventDefault(); toast('Subscribed!', 'success'); }}>
              <input
                type="email"
                placeholder="Your email"
                required
                className="flex-1 p-[10px_12px] border-none rounded-md bg-white/10 text-white placeholder:text-[#9CA3AF] text-sm focus:outline-none focus:border focus:border-primary"
              />
              <button
                type="submit"
                aria-label="Subscribe to newsletter"
                className="p-[10px_16px] bg-linear-to-br from-primary to-primary-light border-none rounded-md text-white cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-hover"
              >
                <i className="fas fa-paper-plane text-sm"></i>
              </button>
            </form>
          </div>
        </div>

        <div className="pt-[15px] border-t border-white/10 text-center text-[#9CA3AF] text-sm">
          <p>&copy; 2026 Life4U. All rights reserved. | Made with ❤️ for humanity</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
