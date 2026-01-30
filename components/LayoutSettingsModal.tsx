
import React, { useState, useEffect } from 'react';
import { useAppStore, THEMES } from '../hooks/useAppStore';
import { useLanguage } from '../hooks/useLanguage';

interface LayoutSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LayoutSettingsModal: React.FC<LayoutSettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    isLayoutMode, setIsLayoutMode, 
    isSidebarPinned, setIsSidebarPinned,
    headerBehavior, setHeaderBehavior,
    theme, setTheme,
    fontSize, setFontSize,
    fontFamily, setFontFamily,
    activeTab, resetLayout
  } = useAppStore();
  const { t } = useLanguage();

  // Local State for Buffering
  const [localPinned, setLocalPinned] = useState(isSidebarPinned);
  const [localHeaderBehavior, setLocalHeaderBehavior] = useState(headerBehavior);
  const [localFontSize, setLocalFontSize] = useState(fontSize);
  const [localFontFamily, setLocalFontFamily] = useState(fontFamily);
  const [localLayoutMode, setLocalLayoutMode] = useState(isLayoutMode);
  const [localTheme, setLocalTheme] = useState(theme);

  useEffect(() => {
      if (isOpen) {
          setLocalPinned(isSidebarPinned);
          setLocalHeaderBehavior(headerBehavior);
          setLocalFontSize(fontSize);
          setLocalFontFamily(fontFamily);
          setLocalLayoutMode(isLayoutMode);
          setLocalTheme(theme);
      }
  }, [isOpen, isSidebarPinned, headerBehavior, fontSize, fontFamily, isLayoutMode, theme]);

  if (!isOpen) return null;

  const handleSave = () => {
      setIsSidebarPinned(localPinned);
      setHeaderBehavior(localHeaderBehavior);
      setFontSize(localFontSize);
      setFontFamily(localFontFamily);
      setIsLayoutMode(localLayoutMode);
      setTheme(localTheme);
      onClose();
  };

  const fontSizes = [
      { label: 'Pequeno', value: '87.5%' },
      { label: 'Normal', value: '100%' },
      { label: 'Grande', value: '112.5%' },
      { label: 'Extra', value: '125%' },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[2000]" onClick={onClose}>
      <div className="bg-bg-card p-6 rounded-lg shadow-xl w-full max-w-md text-light max-h-[90vh] flex flex-col border border-white/10" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-xl font-bold uppercase tracking-widest">{t('layoutAndTheme')}</h2>
          <button onClick={onClose} className="text-gray-text hover:text-light transition-colors"><i className="fas fa-times text-xl"></i></button>
        </div>
        
        <div className="space-y-6 overflow-y-auto pr-2 flex-grow custom-scrollbar">
          {/* Sidebar Pin */}
          <div>
            <h3 className="text-xs font-black uppercase text-gray-500 mb-3 tracking-widest">{t('sidebarBehavior')}</h3>
            <label className="flex items-center justify-between bg-bg-main p-4 rounded-xl cursor-pointer hover:bg-white/5 transition-colors border border-white/5">
              <span className="font-bold text-sm">{t('pinSidebar')}</span>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={localPinned}
                  onChange={() => setLocalPinned(!localPinned)} 
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${localPinned ? 'bg-primary' : 'bg-gray-700'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${localPinned ? 'translate-x-4' : ''}`}></div>
              </div>
            </label>
          </div>

          {/* Header Behavior */}
          <div>
            <h3 className="text-xs font-black uppercase text-gray-500 mb-3 tracking-widest">{t('headerBehavior')}</h3>
            <div className="flex gap-2 bg-bg-main p-1 rounded-xl border border-white/5">
              <button onClick={() => setLocalHeaderBehavior('scroll')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${localHeaderBehavior === 'scroll' ? 'bg-secondary text-white shadow-lg' : 'text-gray-500 hover:text-light'}`}>
                  {t('scrollHeader')}
              </button>
              <button onClick={() => setLocalHeaderBehavior('sticky')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${localHeaderBehavior === 'sticky' ? 'bg-secondary text-white shadow-lg' : 'text-gray-500 hover:text-light'}`}>
                  {t('stickyHeader')}
              </button>
            </div>
          </div>
          
          {/* Font Size */}
          <div>
              <h3 className="text-xs font-black uppercase text-gray-500 mb-3 tracking-widest">Tamanho da Fonte</h3>
              <div className="grid grid-cols-4 gap-2 bg-bg-main p-1 rounded-xl border border-white/5">
                  {fontSizes.map(f => (
                      <button 
                          key={f.value} 
                          onClick={() => setLocalFontSize(f.value)}
                          className={`py-2 rounded-lg text-center text-[10px] font-black uppercase transition-all ${localFontSize === f.value ? 'bg-primary text-black' : 'text-gray-500 hover:text-light'}`}
                      >
                          {f.label}
                      </button>
                  ))}
              </div>
          </div>
          
          {/* Theme Selection */}
          <div>
            <h3 className="text-xs font-black uppercase text-gray-500 mb-3 tracking-widest">Tema Visual</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(THEMES).map(([themeKey, themeData]) => {
                const config = themeData as { name: string; colors: Record<string, string> };
                const isSelected = localTheme === themeKey;
                return (
                  <button
                    key={themeKey}
                    onClick={() => setLocalTheme(themeKey)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${isSelected ? 'border-primary bg-primary/5' : 'border-white/5 bg-bg-main hover:border-white/20'}`}
                  >
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-primary' : 'text-gray-400'}`}>{config.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-white/5 flex gap-3 flex-shrink-0">
            <button onClick={onClose} className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-light transition-colors">Cancelar</button>
            <button onClick={handleSave} className="flex-[2] py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">Salvar Alterações</button>
        </div>
      </div>
    </div>
  );
};

export default LayoutSettingsModal;
