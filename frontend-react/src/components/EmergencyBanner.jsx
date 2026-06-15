import React from 'react';

const EmergencyBanner = ({ onShowModal }) => {
  return (
    <div className="bg-linear-to-br from-primary to-primary-light py-3 relative z-[1001] animate-pulse-banner">
      <div className="max-w-[1400px] mx-auto px-[30px] flex items-center justify-center gap-[15px] text-white font-semibold text-base flex-wrap">
        <i className="fas fa-exclamation-triangle text-[1.3rem] animate-shake"></i>
        <span>Emergency Need? </span>
        <button
          onClick={onShowModal}
          className="text-white no-underline border-b-2 border-dashed border-white/50 pb-0.5 transition-colors duration-300 hover:border-white cursor-pointer bg-transparent"
        >
          Click Here for Immediate Blood Request
        </button>
        <span> • 24/7 Helpline: 1800-123-4567</span>
      </div>
    </div>
  );
};

export default EmergencyBanner;
