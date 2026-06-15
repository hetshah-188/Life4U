import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [isNavActive, setIsNavActive] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const toggleNav = () => setIsNavActive(!isNavActive);
  const closeNav = () => setIsNavActive(false);

  return (
    <header className="bg-white/95 backdrop-blur-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] sticky top-0 z-1000">
      <nav className="max-w-[1400px] mx-auto px-[30px] py-[15px] flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2.5 text-[1.8rem] font-extrabold font-clash bg-linear-to-br from-primary to-primary-light bg-clip-text text-transparent no-underline">
          <i className="fas fa-droplet text-[2rem] animate-drop"></i>
          <span>Life4U</span>
        </Link>

        <ul className={`flex items-center gap-[30px] list-none m-0 p-0 transition-all duration-300 ease-in-out md:flex md:static md:w-auto md:h-auto md:bg-transparent md:flex-row md:p-0 ${isNavActive ? 'active fixed top-20 left-0 w-full h-[calc(100vh-80px)] bg-white/98 backdrop-blur-[20px] flex-col p-[40px_30px] z-999' : 'fixed top-20 -left-full w-full h-[calc(100vh-80px)] bg-white/98 backdrop-blur-[20px] flex-col p-[40px_30px] z-999'}`}>
          <li className="w-full text-center md:w-auto md:static"><NavLink to="/" className={({isActive}) => `text-dark font-medium text-base py-2 transition-colors duration-300 relative block md:inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-linear-to-br after:from-primary after:to-primary-light after:transition-[width] after:duration-300 hover:text-primary ${isActive ? 'active after:w-full' : 'after:w-0'}`} onClick={closeNav}>Home</NavLink></li>
          <li className="w-full text-center md:w-auto md:static"><NavLink to="/about" className={({isActive}) => `text-dark font-medium text-base py-2 transition-colors duration-300 relative block md:inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-linear-to-br after:from-primary after:to-primary-light after:transition-[width] after:duration-300 hover:text-primary ${isActive ? 'active after:w-full' : 'after:w-0'}`} onClick={closeNav}>About Us</NavLink></li>
          <li className="w-full text-center md:w-auto md:static"><NavLink to="/why-donate" className={({isActive}) => `text-dark font-medium text-base py-2 transition-colors duration-300 relative block md:inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-linear-to-br after:from-primary after:to-primary-light after:transition-[width] after:duration-300 hover:text-primary ${isActive ? 'active after:w-full' : 'after:w-0'}`} onClick={closeNav}>Why Donate</NavLink></li>
          <li className="w-full text-center md:w-auto md:static"><NavLink to="/become-donor" className={({isActive}) => `text-dark font-medium text-base py-2 transition-colors duration-300 relative block md:inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-linear-to-br after:from-primary after:to-primary-light after:transition-[width] after:duration-300 hover:text-primary ${isActive ? 'active after:w-full' : 'after:w-0'}`} onClick={closeNav}>Become a Donor</NavLink></li>
          <li className="w-full text-center md:w-auto md:static"><NavLink to="/contact" className={({isActive}) => `text-dark font-medium text-base py-2 transition-colors duration-300 relative block md:inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-linear-to-br after:from-primary after:to-primary-light after:transition-[width] after:duration-300 hover:text-primary ${isActive ? 'active after:w-full' : 'after:w-0'}`} onClick={closeNav}>Contact</NavLink></li>

          {user ? (
            <li className="flex flex-col md:flex-row items-center gap-3 md:ml-5 w-full md:w-auto">
              <Link to={user.role === 'admin' || user.role === 'staff' ? '/admin-dashboard' : user.role === 'recipient' ? '/patient-dashboard' : '/donor-dashboard'} className="text-dark font-medium px-4 py-2 transition-colors duration-300 hover:text-primary no-underline text-center w-full md:w-auto" onClick={closeNav}>Dashboard</Link>
              <button 
                onClick={() => { closeNav(); logout(); }} 
                className="px-6 py-2.5 bg-linear-to-br from-primary to-primary-light rounded-2xl text-white font-semibold transition-all duration-300 border-none hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(255,51,102,0.3)] cursor-pointer w-full md:w-auto text-center"
              >
                Logout
              </button>
            </li>
          ) : (
            <li className="flex flex-col md:flex-row items-center gap-3 md:ml-5 w-full md:w-auto">
              <Link to="/login" className="px-6 py-2.5 border-2 border-primary rounded-2xl text-primary font-semibold transition-all duration-300 bg-transparent hover:bg-linear-to-br hover:from-primary hover:to-primary-light hover:text-white hover:border-transparent hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(255,51,102,0.2)] no-underline w-full md:w-auto text-center" onClick={closeNav}>Login</Link>
              <Link to="/signup" className="px-6 py-2.5 bg-linear-to-br from-primary to-primary-light rounded-2xl text-white font-semibold transition-all duration-300 border-none hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(255,51,102,0.3)] no-underline w-full md:w-auto text-center" onClick={closeNav}>Sign Up</Link>
            </li>
          )}
        </ul>

        <div className="md:hidden text-[1.8rem] cursor-pointer bg-linear-to-br from-primary to-primary-light bg-clip-text text-transparent" onClick={toggleNav}>
          <i className={`fas ${isNavActive ? 'fa-times' : 'fa-bars'}`}></i>
        </div>
      </nav>
    </header>
  );
};

export default Header;
