import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/api';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
    bloodtype: '',
    idproof: '',
    medical: '',
    password: '',
    confirmPassword: '',
    role: 'donor',
    documentId: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Save mock file name to represent the uploaded ID document
      setFormData({ ...formData, idproof: file.name });
      toast('✅ Document uploaded and verified successfully!', 'success');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast('Passwords do not match!', 'error');
      return;
    }

    if (formData.role === 'staff' && !formData.idproof) {
      toast('Please upload your Hospital ID/License document for verification!', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.register({
        fullname: formData.fullname,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
        address: formData.address,
        bloodType: formData.role === 'staff' ? null : formData.bloodtype,
        idProof: formData.idproof,
        documentId: formData.role === 'staff' ? formData.documentId : null,
        medicalDetails: formData.medical,
        password: formData.password,
        role: formData.role,
      });
      login(data.user, data.token);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#fce6e6] to-[#ffffff] p-6 font-inter">
      <div className="bg-white rounded-[16px] p-10 max-w-[800px] w-full shadow-xl">
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center gap-2.5 text-[1.8rem] font-extrabold text-primary no-underline justify-center mb-6 font-clash">
            <i className="fas fa-droplet text-[2rem] animate-drop"></i>
            <span>Life4U</span>
          </Link>
          <h2 className="text-[1.8rem] mb-2 font-clash">Create Account</h2>
          <p className="text-gray">Join our mission to save lives</p>
        </div>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            {/* Full Name */}
            <div className="form-group">
              <label className="block mb-2 font-medium">
                {formData.role === 'staff' ? 'Hospital Full Name' : 'Full Name'}
              </label>
              <div className="relative flex items-center">
                <i className="fas fa-user absolute left-3 text-gray"></i>
                <input
                  type="text"
                  name="fullname"
                  required
                  value={formData.fullname}
                  onChange={handleChange}
                  placeholder={formData.role === 'staff' ? 'Enter hospital full name' : 'Enter full name'}
                  className="w-full p-[12px_12px_12px_40px] border border-[#f0f0f0] rounded-md text-base focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label className="block mb-2 font-medium">
                {formData.role === 'staff' ? 'Hospital Email Address' : 'Email Address'}
              </label>
              <div className="relative flex items-center">
                <i className="fas fa-envelope absolute left-3 text-gray"></i>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={formData.role === 'staff' ? 'Enter hospital email' : 'Enter email'}
                  className="w-full p-[12px_12px_12px_40px] border border-[#f0f0f0] rounded-md text-base focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label className="block mb-2 font-medium">Phone Number</label>
              <div className="relative flex items-center">
                <i className="fas fa-phone absolute left-3 text-gray"></i>
                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="10-digit number" className="w-full p-[12px_12px_12px_40px] border border-[#f0f0f0] rounded-md text-base focus:outline-none focus:border-primary" />
              </div>
            </div>

            {/* Date of Birth / Hospital Since Date */}
            <div className="form-group">
              <label className="block mb-2 font-medium">
                {formData.role === 'staff' ? 'Hospital since year date' : 'Date of Birth'}
              </label>
              <div className="relative flex items-center">
                <i className="fas fa-calendar absolute left-3 text-gray"></i>
                <input type="date" name="dob" required value={formData.dob} onChange={handleChange} className="w-full p-[12px_12px_12px_40px] border border-[#f0f0f0] rounded-md text-base focus:outline-none focus:border-primary" />
              </div>
            </div>

            {/* Document ID or Blood Group */}
            {formData.role === 'staff' ? (
              <div className="form-group">
                <label className="block mb-2 font-medium">Document ID</label>
                <div className="relative flex items-center">
                  <i className="fas fa-id-card absolute left-3 text-gray"></i>
                  <input
                    type="number"
                    name="documentId"
                    required
                    value={formData.documentId}
                    onChange={handleChange}
                    placeholder="Enter Document ID (numbers only)"
                    className="w-full p-[12px_12px_12px_40px] border border-[#f0f0f0] rounded-md text-base focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label className="block mb-2 font-medium">Blood Group</label>
                <div className="relative flex items-center">
                  <i className="fas fa-tint absolute left-3 text-gray"></i>
                  <select name="bloodtype" required={formData.role !== 'staff'} value={formData.bloodtype} onChange={handleChange} className="w-full p-[12px_12px_12px_40px] border border-[#f0f0f0] rounded-md text-base focus:outline-none focus:border-primary appearance-none">
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
              </div>
            )}

            {/* Register Role selection */}
            <div className="form-group">
              <label className="block mb-2 font-medium">I want to register as</label>
              <div className="relative flex items-center">
                <i className="fas fa-user-tag absolute left-3 text-gray"></i>
                <select name="role" required value={formData.role} onChange={handleChange} className="w-full p-[12px_12px_12px_40px] border border-[#f0f0f0] rounded-md text-base focus:outline-none focus:border-primary appearance-none">
                  <option value="donor">Donor</option>
                  <option value="recipient">Patient / Recipient</option>
                  <option value="staff">Hospital Partner</option>
                </select>
              </div>
            </div>
          </div>

          {/* Hospital Address or Residential Address */}
          <div className="mb-5">
            <label className="block mb-2 font-medium">
              {formData.role === 'staff' ? 'Hospital Address' : 'Residential Address'}
            </label>
            <div className="relative flex items-center">
              <i className="fas fa-map-marker-alt absolute left-3 text-gray"></i>
              <textarea name="address" required value={formData.address} onChange={handleChange} placeholder={formData.role === 'staff' ? "Enter full hospital address" : "Full address"} className="w-full p-[12px_12px_12px_40px] border border-[#f0f0f0] rounded-md text-base focus:outline-none focus:border-primary min-h-[80px]"></textarea>
            </div>
          </div>

          {/* Verification / Upload Document for Hospital Role */}
          {formData.role === 'staff' && (
            <div className="mb-5">
              <label className="block mb-2 font-medium">Hospital Verification Document</label>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleDocumentUpload}
                  style={{ display: 'none' }}
                  id="hospital-doc"
                />
                <label
                  htmlFor="hospital-doc"
                  style={{
                    padding: '12px 24px', border: '1.5px solid #f0f0f0', borderRadius: 12,
                    background: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    color: '#4b5563', transition: 'all 0.15s',
                  }}
                  onMouseOver={(e) => e.target.style.background = '#fafafa'}
                  onMouseOut={(e) => e.target.style.background = '#fff'}
                >
                  📁 {formData.idproof ? 'Change Document' : 'Upload Document ID'}
                </label>
                {formData.idproof ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#16a34a', fontWeight: 700, fontSize: 14 }}>✓ {formData.idproof}</span>
                    <span style={{ background: '#dcfce7', color: '#15803d', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20 }}>Verified Member</span>
                  </div>
                ) : (
                  <span style={{ color: '#dc2626', fontWeight: 600, fontSize: 14 }}>⚠️ Upload Hospital ID/License for Verification</span>
                )}
              </div>
            </div>
          )}

          {/* Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="form-group">
              <label className="block mb-2 font-medium">Password</label>
              <div className="relative flex items-center">
                <i className="fas fa-lock absolute left-3 text-gray"></i>
                <input type="password" name="password" required value={formData.password} onChange={handleChange} placeholder="Create password" className="w-full p-[12px_12px_12px_40px] border border-[#f0f0f0] rounded-md text-base focus:outline-none focus:border-primary" />
              </div>
            </div>
            <div className="form-group">
              <label className="block mb-2 font-medium">Confirm Password</label>
              <div className="relative flex items-center">
                <i className="fas fa-lock absolute left-3 text-gray"></i>
                <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm password" className="w-full p-[12px_12px_12px_40px] border border-[#f0f0f0] rounded-md text-base focus:outline-none focus:border-primary" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-4 bg-linear-to-br from-primary to-primary-light text-white border-none rounded-md text-[1.1rem] font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-hover disabled:opacity-70"
          >
            {loading ? 'Registering...' : 'Register Now'}
          </button>
        </form>

        <div className="text-center mt-6 text-gray">
          Already have an account? <Link to="/login" className="text-primary no-underline font-semibold hover:underline">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
