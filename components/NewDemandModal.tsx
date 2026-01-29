
import React, { useState, useEffect } from 'react';
import { Demand, Photo, Attachment } from '../types';
import { fileToBase64, base64ToSrc, validateFileFormat, ALLOWED_EXTENSIONS } from '../services/fileService';

interface NewDemandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (demandData: Omit<Demand, 'id' | 'date' | 'status'>, id?: string) => void;
  openImageEditor: (photo: Photo) => void;
  demandToEdit?: Demand | null;
}

const NewDemandModal: React.FC<NewDemandModalProps> = ({ isOpen, onClose, onSave, openImageEditor, demandToEdit }) => {
  const [client, setClient] = useState('');
  const [contact, setContact] = useState('');
  const [service, setService] = useState('');
  const [setor, setSetor] = useState('');
  const [urgencia, setUrgencia] = useState<'Baixa' | 'Média' | 'Alta' | 'Crítica'>('Baixa');
  const [prazo, setPrazo] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [emailAviso, setEmailAviso] = useState('');
  const [celAviso, setCelAviso] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  
  // States for visual feedback during upload
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);
  const [photoSuccess, setPhotoSuccess] = useState(false);
  const [docSuccess, setDocSuccess] = useState(false);

  const resetForm = () => {
    setClient('');
    setContact('');
    setService('');
    setSetor('');
    setUrgencia('Baixa');
    setPrazo('');
    setResponsavel('');
    setEmailAviso('');
    setCelAviso('');
    setPhotos([]);
    setAttachments([]);
    setDateStart('');
    setDateEnd('');
    setIsUploadingPhotos(false);
    setIsUploadingDocs(false);
    setPhotoSuccess(false);
    setDocSuccess(false);
  };

  useEffect(() => {
    if (isOpen) {
        if (demandToEdit) {
            setClient(demandToEdit.client);
            setContact(demandToEdit.contact);
            setService(demandToEdit.service);
            setSetor(demandToEdit.setor);
            setUrgencia(demandToEdit.urgencia as any);
            setPrazo(demandToEdit.prazo);
            setResponsavel(demandToEdit.responsavel);
            setEmailAviso(demandToEdit.emailAviso);
            setCelAviso(demandToEdit.celAviso);
            setPhotos(demandToEdit.photos);
            setAttachments(demandToEdit.attachments);
            setDateStart(demandToEdit.dateStart || '');
            setDateEnd(demandToEdit.dateEnd || '');
        } else {
            resetForm();
        }
    }
  }, [isOpen, demandToEdit]);


  if (!isOpen) return null;
  
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploadingPhotos(true);
      setPhotoSuccess(false);
      
      const files = (Array.from(e.target.files) as File[]).slice(0, 4 - photos.length);
      
      const validFiles = files.filter(file => {
        if (!validateFileFormat(file)) {
          alert(`O arquivo "${file.name}" não é permitido. Formatos aceitos: ${ALLOWED_EXTENSIONS.join(', ')}`);
          return false;
        }
        return true;
      });

      try {
          // Add a small artificial delay to show the "Processing" state to the user
          await new Promise(resolve => setTimeout(resolve, 800));

          const newPhotosPromises = validFiles.map(async (file: File) => {
            const base64 = await fileToBase64(file);
            return { id: crypto.randomUUID(), src: base64, name: file.name };
          });
          const newPhotos = await Promise.all(newPhotosPromises);
          setPhotos(prev => [...prev, ...newPhotos]);
          
          if (newPhotos.length > 0) {
              setPhotoSuccess(true);
              setTimeout(() => setPhotoSuccess(false), 3000);
          }
      } catch (err) {
          alert("Erro ao processar imagens.");
      } finally {
          setIsUploadingPhotos(false);
          e.target.value = '';
      }
    }
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        setIsUploadingDocs(true);
        setDocSuccess(false);
        
        const files = (Array.from(e.target.files) as File[]).slice(0, 2 - attachments.length);
        
        const validFiles = files.filter(file => {
          if (!validateFileFormat(file)) {
            alert(`O arquivo "${file.name}" não é permitido. Formatos aceitos: ${ALLOWED_EXTENSIONS.join(', ')}`);
            return false;
          }
          return true;
        });

        // Simulate processing for visual feedback
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newAttachments: Attachment[] = validFiles.map((file: File) => ({
            id: crypto.randomUUID(),
            name: file.name,
            size: file.size,
            url: '',
            type: file.type
        }));
        
        setAttachments(prev => [...prev, ...newAttachments]);
        
        if (newAttachments.length > 0) {
            setDocSuccess(true);
            setTimeout(() => setDocSuccess(false), 3000);
        }
        
        setIsUploadingDocs(false);
        e.target.value = '';
    }
  };
  
  const removePhoto = (id: string) => {
      setPhotos(photos.filter(p => p.id !== id));
  }

  const removeAttachment = (id: string) => {
      setAttachments(attachments.filter(a => a.id !== id));
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // FIX: Include 'comments' property to satisfy Omit<Demand, 'id' | 'status' | 'date'> requirement
    onSave({
      client, 
      contact, 
      service, 
      setor, 
      urgencia, 
      prazo, 
      responsavel, 
      emailAviso, 
      celAviso, 
      photos, 
      attachments, 
      dateStart, 
      dateEnd,
      comments: demandToEdit?.comments || []
    }, demandToEdit?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1001] backdrop-blur-sm" onClick={onClose}>
      <div className="bg-bg-card p-8 rounded-2xl shadow-2xl w-full max-w-3xl text-light max-h-[90vh] overflow-y-auto border border-border-color animate-fade-in" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-6 border-b border-border-color pb-4">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center text-secondary">
                    <i className="fas fa-edit"></i>
                </div>
                {demandToEdit ? 'Ajustar Demanda' : 'Nova Requisição'}
              </h2>
              <button type="button" onClick={onClose} className="text-gray-500 hover:text-light transition-colors"><i className="fas fa-times text-xl"></i></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="form-group">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Nome do Cliente</label>
                <input type="text" value={client} onChange={e => setClient(e.target.value)} required className="input-style" placeholder="Razão Social ou Nome Fantasia" />
            </div>
            <div className="form-group">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Contato / Telefone</label>
                <input type="text" value={contact} onChange={e => setContact(e.target.value)} className="input-style" placeholder="(00) 00000-0000" />
            </div>
            <div className="form-group">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Setor Interno</label>
                <input type="text" value={setor} onChange={e => setSetor(e.target.value)} className="input-style" placeholder="Ex: Logística, Fiscal..." />
            </div>
            <div className="form-group">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Responsável Direto</label>
                <input type="text" value={responsavel} onChange={e => setResponsavel(e.target.value)} className="input-style" placeholder="Quem cuidará deste chamado?" />
            </div>
            <div className="form-group">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Nível de Urgência</label>
                <select value={urgencia} onChange={e => setUrgencia(e.target.value as any)} className="input-style">
                    <option value="Baixa">Baixa (Rotina)</option>
                    <option value="Média">Média (Importante)</option>
                    <option value="Alta">Alta (Prioritário)</option>
                    <option value="Crítica">Crítica (Imediato)</option>
                </select>
            </div>
            <div className="form-group">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Prazo Final Estimado</label>
                <input type="datetime-local" value={prazo} onChange={e => setPrazo(e.target.value)} className="input-style" />
            </div>
            <div className="form-group md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Escopo do Serviço</label>
                <textarea value={service} onChange={e => setService(e.target.value)} required className="input-style min-h-[100px] resize-none" placeholder="Descreva detalhadamente a operação..."></textarea>
            </div>
            <div className="form-group">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Início da Operação (Gantt)</label>
                <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} required className="input-style" />
            </div>
            <div className="form-group">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Previsão Término (Gantt)</label>
                <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} required className="input-style" />
            </div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between items-center mb-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Registros Fotográficos (Máx 4)</label>
                {photoSuccess && (
                    <span className="text-[10px] font-bold text-success animate-fade-in flex items-center gap-1">
                        <i className="fas fa-check-circle"></i> Fotos adicionadas com sucesso!
                    </span>
                )}
            </div>
            
            <div className="relative group/upload">
                <input type="file" multiple accept=".jpg,.jpeg,.png" onChange={handlePhotoUpload} className="hidden" id="photo-upload" disabled={photos.length >= 4 || isUploadingPhotos}/>
                <label htmlFor="photo-upload" className={`w-full h-24 border-2 border-dashed border-border-color rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group ${photos.length >= 4 || isUploadingPhotos ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isUploadingPhotos ? (
                        <div className="flex flex-col items-center gap-1">
                            <i className="fas fa-spinner fa-spin text-primary text-xl"></i>
                            <span className="text-[10px] font-black uppercase text-primary">Processando Arquivos...</span>
                        </div>
                    ) : (
                        <>
                            <i className="fas fa-camera text-2xl text-gray-600 group-hover:text-primary transition-colors"></i>
                            <span className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-tighter">Clique ou arraste fotos aqui</span>
                        </>
                    )}
                </label>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                {photos.map(p => (
                    <div key={p.id} className="relative group h-28 rounded-xl overflow-hidden border border-border-color shadow-sm animate-slide-up">
                        <img src={base64ToSrc(p.src, 'image/jpeg')} alt="upload preview" className="w-full h-full object-cover"/>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                            <button type="button" onClick={() => openImageEditor(p)} className="w-8 h-8 rounded-lg bg-primary/20 text-primary border border-primary/30 flex items-center justify-center hover:bg-primary hover:text-white transition-all" title="Editar com IA"><i className="fas fa-magic text-xs"></i></button>
                            <button type="button" onClick={() => removePhoto(p.id)} className="w-8 h-8 rounded-lg bg-danger/20 text-danger border border-danger/30 flex items-center justify-center hover:bg-danger hover:text-white transition-all" title="Remover"><i className="fas fa-trash text-xs"></i></button>
                        </div>
                    </div>
                ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Documentação Auxiliar (Máx 2)</label>
                {docSuccess && (
                    <span className="text-[10px] font-bold text-success animate-fade-in flex items-center gap-1">
                        <i className="fas fa-check-circle"></i> Documento anexado com sucesso!
                    </span>
                )}
            </div>

            <div className="relative">
                <input type="file" multiple accept=".pdf,.doc,.docx" onChange={handleAttachmentUpload} className="hidden" id="doc-upload" disabled={attachments.length >= 2 || isUploadingDocs}/>
                <label htmlFor="doc-upload" className={`w-full p-4 border-2 border-dashed border-border-color rounded-xl flex items-center justify-center gap-3 cursor-pointer hover:border-secondary/50 hover:bg-secondary/5 transition-all group ${attachments.length >= 2 || isUploadingDocs ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isUploadingDocs ? (
                        <>
                            <i className="fas fa-circle-notch fa-spin text-secondary"></i>
                            <span className="text-[10px] font-black uppercase text-secondary">Anexando Documentos...</span>
                        </>
                    ) : (
                        <>
                            <i className="fas fa-paperclip text-gray-600 group-hover:text-secondary transition-colors"></i>
                            <span className="text-[10px] font-bold text-gray-500 uppercase">Anexar Contratos, NF ou PDF</span>
                        </>
                    )}
                </label>
            </div>

            <div className='mt-4 space-y-2'>
                {attachments.map(a => (
                    <div key={a.id} className="flex items-center justify-between bg-bg-main/50 p-3 rounded-xl border border-border-color/50 animate-slide-up group">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary">
                                <i className="fas fa-file-alt text-xs"></i>
                            </div>
                            <span className="text-xs font-bold text-gray-300 truncate">{a.name}</span>
                        </div>
                        <button type="button" onClick={() => removeAttachment(a.id)} className="text-gray-600 hover:text-danger p-2 transition-colors" title="Remover"><i className="fas fa-times"></i></button>
                    </div>
                ))}
            </div>
          </div>

          <div className="mt-10 flex justify-end gap-3 border-t border-border-color pt-6">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-bg-main text-gray-400 font-bold rounded-xl hover:text-light transition-all text-xs uppercase tracking-widest border border-border-color">Cancelar</button>
            <button type="submit" className="px-10 py-3 bg-primary text-white font-black rounded-xl hover:opacity-90 shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1 text-xs uppercase tracking-[0.2em]">
                <i className="fas fa-save mr-2"></i> Finalizar Registro
            </button>
          </div>
        </form>
        <style>{`
          .form-group label { display: block; margin-bottom: 5px; font-size: 0.9rem; color: #9ca3af; }
          .input-style { 
              width: 100%; 
              padding: 12px 16px; 
              background: #0f172a; 
              border: 1px solid #1e293b; 
              border-radius: 12px; 
              color: #f8fafc; 
              font-size: 0.875rem; 
              font-weight: 500;
              box-sizing: border-box; 
              transition: all 0.2s;
              outline: none;
          }
          .input-style:focus { border-color: var(--color-primary-val); box-shadow: 0 0 0 2px rgba(var(--color-primary-val), 0.1); }
          .input-style::placeholder { color: #475569; }
          
          @keyframes slide-up {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-up {
              animation: slide-up 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
};

export default NewDemandModal;
