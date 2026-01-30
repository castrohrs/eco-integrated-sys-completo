
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import FloatingInternalChat from './FloatingInternalChat';

const FloatingToolsHub: React.FC = () => {
    const { activeFloatingTool, setActiveFloatingTool } = useAppStore();
    const [noteContent, setNoteContent] = useState('');

    useEffect(() => {
        const savedNote = localStorage.getItem('ecolog-floating-note');
        if (savedNote) setNoteContent(savedNote);
    }, []);

    const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setNoteContent(newContent);
        localStorage.setItem('ecolog-floating-note', newContent);
    };

    return (
        <>
            {activeFloatingTool === 'chat' && <div className="fixed bottom-24 right-6 z-[2400]"><FloatingInternalChat /></div>}
            
            {activeFloatingTool === 'notes' && (
                <div className="fixed bottom-24 right-12 z-[2400] w-[350px] bg-bg-card border border-border-color rounded-xl shadow-2xl p-4 animate-fade-in-up">
                    <div className="flex justify-between items-center mb-3 border-b border-border-color pb-2">
                        <h3 className="font-bold text-light flex items-center gap-2"><i className="fas fa-sticky-note text-yellow-500"></i> Notas Rápidas</h3>
                        <button onClick={() => setActiveFloatingTool(null)}><i className="fas fa-times text-gray-500 hover:text-white"></i></button>
                    </div>
                    <textarea 
                        className="w-full h-40 bg-bg-main border-none rounded-lg p-2 text-sm text-light focus:ring-1 focus:ring-yellow-500 resize-none" 
                        placeholder="Digite sua nota aqui..."
                        value={noteContent}
                        onChange={handleNoteChange}
                    ></textarea>
                </div>
            )}
        </>
    );
};

export default FloatingToolsHub;
