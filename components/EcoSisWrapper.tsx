
import React from 'react';

const EcoSisWrapper: React.FC = () => {
    return (
        <div className="w-full h-[calc(100vh-140px)] rounded-2xl overflow-hidden border border-border-color shadow-2xl">
            <iframe 
                src="/eco_sis.html" 
                title="Eco.Sis Legado" 
                className="w-full h-full border-none"
            />
        </div>
    );
};

export default EcoSisWrapper;
