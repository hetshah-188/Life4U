import React from 'react';

const LiveTicker = () => {
  const tickerItems = [
    { icon: 'fa-tint', text: 'Someone donated blood in Mumbai just now!', time: '2 min ago' },
    { icon: 'fa-heart', text: '3 lives saved in Delhi through donations', time: '5 min ago' },
    { icon: 'fa-ambulance', text: 'Emergency request fulfilled in Bangalore', time: '10 min ago' },
    { icon: 'fa-user-plus', text: 'New donor registered in Chennai', time: '12 min ago' },
    { icon: 'fa-hospital', text: 'City Hospital received 15 units of A+', time: '15 min ago' },
    { icon: 'fa-tint', text: 'O- blood type urgently needed in Pune', time: '20 min ago' },
    { icon: 'fa-heartbeat', text: 'Cancer patient received platelets', time: '25 min ago' },
    { icon: 'fa-truck', text: 'Blood shipment dispatched to Kolkata', time: '30 min ago' }
  ];

  return (
    <div className="bg-dark py-[15px] overflow-hidden relative">
      <div className="flex animate-ticker whitespace-nowrap hover:[animation-play-state:paused]">
        {[...Array(3)].map((_, i) => (
          <React.Fragment key={i}>
            {tickerItems.map((item, index) => (
              <div key={index} className="inline-flex items-center gap-5 px-10 text-white text-base">
                <i className={`fas ${item.icon} text-primary text-[1.2rem] animate-pulse`}></i>
                <span>{item.text} <strong className="text-primary font-bold ml-1.25">• {item.time}</strong></span>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default LiveTicker;
