import React, { useState, useEffect } from 'react';
import { bloodbankService } from '../services/api';

const BloodStock = ({ onEmergencyRequest }) => {
  const [stocks, setStocks] = useState([
    { type: 'A+', units: 42, status: 'Available', hospital: 'City Hospital', distance: '2 km', percentage: 85 },
    { type: 'O-', units: 15, status: 'Moderate', hospital: 'City Hospital', distance: '2 km', percentage: 30 },
    { type: 'B+', units: 30, status: 'Moderate', hospital: 'General Hospital', distance: '3.5 km', percentage: 60 },
    { type: 'AB+', units: 22, status: 'Moderate', hospital: 'City Hospital', distance: '2 km', percentage: 45 },
    { type: 'A-', units: 12, status: 'Low', hospital: 'General Hospital', distance: '3.5 km', percentage: 25 },
    { type: 'O+', units: 48, status: 'Available', hospital: 'City Hospital', distance: '2 km', percentage: 95 },
    { type: 'B-', units: 10, status: 'Low', hospital: 'General Hospital', distance: '3.5 km', percentage: 20 },
    { type: 'AB-', units: 8, status: 'Critical', hospital: 'City Hospital', distance: '2 km', percentage: 15 }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealTimeStock = async () => {
      try {
        const response = await bloodbankService.getStats();
        if (response.success && response.data?.inventory?.byBloodType) {
          const distribution = response.data.inventory.byBloodType;
          
          // List of default blood types to ensure all 8 are shown even if 0 stock
          const defaultTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
          
          const mappedStocks = defaultTypes.map(type => {
            // Find matched group in database results
            const dbStock = distribution.find(d => d.bloodType === type);
            const availableUnits = dbStock ? parseInt(dbStock.available) : 0;
            
            // Calculate status based on available units
            let status = 'Critical';
            if (availableUnits >= 30) status = 'Available';
            else if (availableUnits >= 15) status = 'Moderate';
            else if (availableUnits >= 5) status = 'Low';
            
            // Percentage (max capacity is e.g. 50 units for full progress bar representation)
            const percentage = Math.min(100, Math.floor((availableUnits / 50) * 100)) || 10; // minimum 10% for visual layout

            return {
              type,
              units: availableUnits,
              status,
              hospital: 'Life4U Central Bank',
              distance: 'Main Center',
              percentage
            };
          });

          setStocks(mappedStocks);
        }
      } catch (error) {
        console.error('Error fetching real-time blood stock:', error);
        // Retain initial fallback state on error
      } finally {
        setLoading(false);
      }
    };

    fetchRealTimeStock();
    const interval = setInterval(fetchRealTimeStock, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'available': return 'bg-[#d1fae5] text-success';
      case 'moderate': return 'bg-[#fff3e0] text-warning';
      case 'low':
      case 'critical': return 'bg-[#ffebee] text-danger';
      default: return 'bg-light text-dark';
    }
  };

  return (
    <section className="py-10 px-6 bg-linear-to-br from-[#FFF5F5] to-[#F0F7FF] relative overflow-hidden" id="blood-stock">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h2 className="text-xl md:text-[1.8rem] font-extrabold font-clash">Current <span className="gradient-text">Blood Stock</span></h2>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-xl text-primary font-semibold text-xs">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse-live"></span>
            <span>Live Updates Every 30s</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {stocks.map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm transition-all duration-300 relative overflow-hidden border border-black/5 hover:-translate-y-1 hover:shadow-md after:content-[''] after:absolute after:top-0 after:right-0 after:w-16 after:h-16 after:bg-linear-to-br after:from-transparent after:to-primary/10 after:rounded-bl-[100%] after:z-[-1]">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xl font-extrabold gradient-text font-clash">{item.type}</div>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${getStatusClass(item.status)}`}>{item.status}</span>
              </div>
              <div className="my-2.5">
                <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-linear-to-br from-primary to-primary-light rounded-full transition-[width] duration-500" style={{ width: `${item.percentage}%` }}></div>
                </div>
                <div className="flex justify-between text-gray text-xs mb-1">
                  <span><i className="fas fa-tint"></i> {item.units} units</span>
                  <span><i className="fas fa-percentage"></i> {item.percentage}%</span>
                </div>
                <div className="flex items-center gap-1 text-gray text-[11px] mt-1">
                  <i className="fas fa-hospital text-[10px]"></i>
                  <span>{item.hospital} • {item.distance}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 py-1.5 bg-light border-none rounded-lg text-dark font-bold text-xs cursor-pointer transition-all duration-300 hover:bg-linear-to-br hover:from-primary hover:to-primary-light hover:text-white">Request</button>
                <button className="flex-1 py-1.5 bg-linear-to-br from-primary to-primary-light border-none rounded-lg text-white font-bold text-xs cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-hover">Donate</button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={onEmergencyRequest}
            className="px-6 py-3 bg-linear-to-br from-primary to-primary-light border-none rounded-xl text-white font-bold text-sm cursor-pointer transition-all duration-300 shadow-md animate-pulse-emergency hover:-translate-y-0.5 hover:shadow-hover"
          >
            <i className="fas fa-exclamation-triangle"></i> EMERGENCY REQUEST
          </button>
        </div>
      </div>
    </section>
  );
};

export default BloodStock;
