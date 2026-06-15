import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { requestService, inventoryService } from '../services/api';
import Layout from '../components/Layout';

const RequestBlood = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    reqBloodType: '',
    reqUnits: 1,
    reqUrgency: 'routine',
    reqHospital: '',
    reqDoctor: '',
    reqContact: '',
    reqDate: '',
    reqPurpose: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reqData, invData] = await Promise.all([
        requestService.getMyRequests(),
        inventoryService.get()
      ]);
      setRequests(reqData.requests || []);
      setInventory(invData.data || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await requestService.create({
        bloodType: formData.reqBloodType,
        units: formData.reqUnits,
        urgency: formData.reqUrgency,
        hospital: formData.reqHospital,
        requiredByDate: formData.reqDate,
        purpose: formData.reqPurpose,
        doctorName: formData.reqDoctor,
        contactNumber: formData.reqContact
      });
      toast(`Request submitted! 📋`);
      setFormData({
        reqBloodType: '',
        reqUnits: 1,
        reqUrgency: 'routine',
        reqHospital: '',
        reqDoctor: '',
        reqContact: '',
        reqDate: ''
      });
      fetchData();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <Layout>
      <div className="bg-[#f8fafc] min-h-screen py-10 px-[30px] font-inter">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-extrabold font-clash mb-2 gradient-text">Emergency Blood Request</h1>
            <p className="text-gray">Fill out the form below to initiate a blood request.</p>
          </div>

          <div className="max-w-[800px] mx-auto bg-white p-8 rounded-[30px] shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium">Blood Type Needed</label>
                  <select name="reqBloodType" required value={formData.reqBloodType} onChange={handleChange} className="w-full p-3 border border-[#f0f0f0] rounded-xl focus:outline-none focus:border-primary appearance-none">
                    <option value="">Select Blood Group</option>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium">Units</label>
                    <input type="number" name="reqUnits" required min="1" value={formData.reqUnits} onChange={handleChange} className="w-full p-3 border border-[#f0f0f0] rounded-xl focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">Urgency</label>
                    <select name="reqUrgency" required value={formData.reqUrgency} onChange={handleChange} className="w-full p-3 border border-[#f0f0f0] rounded-xl focus:outline-none focus:border-primary appearance-none">
                      <option value="routine">Normal</option>
                      <option value="urgent">Urgent</option>
                      <option value="emergency">Critical</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block mb-2 font-medium">Hospital Name & City</label>
                  <input type="text" name="reqHospital" required value={formData.reqHospital} onChange={handleChange} placeholder="Hospital name and city" className="w-full p-3 border border-[#f0f0f0] rounded-xl focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block mb-2 font-medium">Required By Date</label>
                  <input type="date" name="reqDate" required value={formData.reqDate} onChange={handleChange} className="w-full p-3 border border-[#f0f0f0] rounded-xl focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block mb-2 font-medium">Doctor's Name</label>
                  <input type="text" name="reqDoctor" required value={formData.reqDoctor} onChange={handleChange} placeholder="Attending doctor" className="w-full p-3 border border-[#f0f0f0] rounded-xl focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block mb-2 font-medium">Contact Person Number</label>
                  <input type="tel" name="reqContact" required value={formData.reqContact} onChange={handleChange} placeholder="10-digit number" className="w-full p-3 border border-[#f0f0f0] rounded-xl focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block mb-2 font-medium">Purpose / Medical Condition</label>
                <textarea name="reqPurpose" required value={formData.reqPurpose} onChange={handleChange} placeholder="Why is the blood needed?" className="w-full p-3 border border-[#f0f0f0] rounded-xl focus:outline-none focus:border-primary min-h-[100px]"></textarea>
              </div>
              <button type="submit" className="w-full p-4 bg-linear-to-br from-primary to-primary-light text-white font-bold rounded-xl shadow-md hover:-translate-y-0.5 hover:shadow-hover transition-all">Submit Emergency Request</button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RequestBlood;
