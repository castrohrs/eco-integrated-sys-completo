
import React from 'react';

const EcDayWrapper: React.FC = () => {
    return (
        <div className="w-full h-[calc(100vh-140px)] rounded-2xl overflow-hidden border border-border-color shadow-2xl">
            <iframe 
                src="/ec_day.html" 
                title="Ec.Day Calendário" 
                className="w-full h-full border-none"
            />
        </div>
    );
};

export default EcDayWrapper;
