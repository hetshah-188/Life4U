import React from 'react';
import { useToast } from '../context/ToastContext';

const EmergencyModal = ({ isOpen, onClose }) => {
  const toast = useToast();
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    toast('🚨 Emergency request submitted! Our team will contact you within 5 minutes.', 'success');
    onClose();
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-[10px] z-[2000] flex items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-[40px] p-10 max-w-[500px] w-[90%] relative max-h-[90vh] overflow-y-auto animate-slideUp">
        <span
          className="absolute top-5 right-5 text-[1.5rem] cursor-pointer text-gray transition-colors duration-300 hover:text-primary"
          onClick={onClose}
        >
          &times;
        </span>
        <h2 className="mb-[25px] flex items-center gap-2.5 text-danger">
          <i className="fas fa-exclamation-triangle"></i> Emergency Blood Request
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block mb-2 font-medium">Patient Name</label>
            <input
              type="text"
              required
              placeholder="Full name of patient"
              className="w-full p-[12px_15px] border-2 border-[#f0f0f0] rounded-md text-base transition-colors duration-300 focus:outline-none focus:border-primary"
            />
          </div>
          <div className="mb-5">
            <label className="block mb-2 font-medium">Blood Group Needed</label>
            <select
              required
              className="w-full p-[12px_15px] border-2 border-[#f0f0f0] rounded-md text-base transition-colors duration-300 focus:outline-none focus:border-primary"
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
          <div className="mb-5">
            <label className="block mb-2 font-medium">Hospital Name & Location</label>
            <input
              type="text"
              required
              placeholder="Hospital name and city"
              className="w-full p-[12px_15px] border-2 border-[#f0f0f0] rounded-md text-base transition-colors duration-300 focus:outline-none focus:border-primary"
            />
          </div>
          <div className="mb-5">
            <label className="block mb-2 font-medium">Contact Number</label>
            <input
              type="tel"
              required
              placeholder="10-digit mobile number"
              className="w-full p-[12px_15px] border-2 border-[#f0f0f0] rounded-md text-base transition-colors duration-300 focus:outline-none focus:border-primary"
            />
          </div>
          <div className="mb-5">
            <label className="block mb-2 font-medium">Units Needed</label>
            <input
              type="number"
              min="1"
              max="10"
              defaultValue="1"
              className="w-full p-[12px_15px] border-2 border-[#f0f0f0] rounded-md text-base transition-colors duration-300 focus:outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full p-[15px] bg-linear-to-br from-primary to-primary-light text-white border-none rounded-md text-[1.1rem] font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-hover"
          >
            Submit Emergency Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmergencyModal;
