
import React, { useState } from 'react';
import { useAppStore } from '../hooks/useAppStore';

interface StepDetail {
    purpose: string;
    execution: string[];
    docs: string[];
    risks: string[];
    impact: string;
    dependencies: string[];
    outputs: string[];
    relationship: string;
}

const STEP_DETAILS: Record<number, StepDetail> = {
    0: {
        purpose: "Estabelecer a consciência situacional do operador sobre a malha logística portuária global.",
        execution: [
            "Monitoramento de grades de navios e janelas de atracação.",
            "Validação de integridade de elos entre transportadora, porto e cliente.",
            "Cálculo preventivo de custos de permanência."
        ],
        docs: ["Booking Confirmation", "Manifesto Eletrônico", "Bill of Lading"],
        risks: ["Falha na comunicação entre armador e terminal.", "Inconsistência de dados no manifesto."],
        impact: "Atraso em cascata em toda a operação e multas de demurrage.",
        dependencies: ["Plano de Embarque/Desembarque ativo."],
        outputs: ["Protocolo de Prontidão Operacional."],
        relationship: "Alimenta o Dashboard de BI e o Planejamento de Frota."
    },
    1: {
        purpose: "Blindagem fiscal e administrativa da carga em solo nacional.",
        execution: [
            "Conferência tripla: Invoice vs Packing List vs NF-e.",
            "Validação de Incoterms para atribuição de responsabilidades.",
            "Auditoria de pesos e volumes para pesagem portuária."
        ],
        docs: ["Commercial Invoice", "Packing List", "NF-e (Nacional)"],
        risks: ["NCM incorreto gerando infração fiscal.", "Divergência de peso acima da tolerância."],
        impact: "Retenção da carga em canal vermelho e interrupção do fluxo de caixa.",
        dependencies: ["Confirmação de embarque internacional."],
        outputs: ["Instrução de Despacho validada."],
        relationship: "Integração direta com o Módulo Contábil e Leitor OCR."
    },
    2: {
        purpose: "Contratação e reserva jurídica do espaço para transporte internacional.",
        execution: [
            "Solicitação formalizada via portal do armador.",
            "Validação de drafts de BL antes da emissão definitiva.",
            "Checagem de termos de liberação de container vazio."
        ],
        docs: ["Master BL", "House BL", "Draft de Reserva"],
        risks: ["Rolagem de carga por falta de espaço.", "Documentação Master inconsistente."],
        impact: "Carga impossibilitada de embarque e perda de conexão marítima.",
        dependencies: ["Pagamento de Frete Internacional.", "Liberação de Crédito."],
        outputs: ["Número de Booking para agendamento de Gate."],
        relationship: "Base para a emissão do Manifesto de Carga e CT-e."
    },
    3: {
        purpose: "Gestão cronológica da atracação para otimização de recursos terrestres.",
        execution: [
            "Acompanhamento de ETA/ETB em tempo real.",
            "Notificação prévia à equipe de transporte terrestre.",
            "Validação de prontidão de liberação de descarga."
        ],
        docs: ["Schedule de Atracação", "Aviso de Chegada de Navio"],
        risks: ["Congestionamento de berço.", "Omissão de escala inesperada."],
        impact: "Ociosidade forçada da frota e custos de estadia de motoristas.",
        dependencies: ["Livre Prática da ANVISA/Receita."],
        outputs: ["Slot de coleta definido."],
        relationship: "Sincroniza o Calendário Operacional com a realidade física."
    },
    4: {
        purpose: "Segurança e conformidade no fluxo físico do terminal portuário.",
        execution: [
            "Agendamento de janelas via sistema do terminal (Porto sem Papel).",
            "Check-in físico e validação biométrica do motorista.",
            "Conferência de lacres e integridade física do container."
        ],
        docs: ["Ticket de Balança", "EIR (Equip. Interchange)", "Gate Pass"],
        risks: ["Veículo não cadastrado no terminal.", "Lacres com divergência de numeração."],
        impact: "Barramento do veículo no gate e perda de agendamento.",
        dependencies: ["Cadastro de Frota ativo.", "Documentação fiscal autorizada."],
        outputs: ["Comprovante de Entrada/Saída (Gate-In/Out)."],
        relationship: "Integração com ECO.FROTA e Checklist Operacional."
    },
    5: {
        purpose: "Formalização tributária e legal da carga perante a Receita Federal.",
        execution: [
            "Elaboração e registro da DI no sistema Siscomex.",
            "Recolhimento automático de impostos de importação.",
            "Monitoramento de parametrização (Verde, Amarelo, Vermelho)."
        ],
        docs: ["Declaração de Importação (DI)", "Comprovante de Importação (CI)"],
        risks: ["Valoração aduaneira contestada.", "Falta de licença de importação específica."],
        impact: "Apreensão da mercadoria ou penalidades administrativas severas.",
        dependencies: ["BL Liberado.", "Pagamento de impostos efetuado."],
        outputs: ["Carga Nacionalizada e liberada para transporte."],
        relationship: "Impacto direto no Fluxo de Caixa e no Dashboard Financeiro."
    },
    6: {
        purpose: "Execução física do transporte com total conformidade fiscal.",
        execution: [
            "Emissão de CT-e vinculado à NF-e.",
            "Geração de MDF-e para encerramento de trajeto.",
            "Monitoramento de jornada e segurança da carga."
        ],
        docs: ["CT-e", "MDF-e", "DANFE"],
        risks: ["Documento fiscal rejeitado pela SEFAZ.", "Excesso de peso por eixo detectado em balança."],
        impact: "Multas pesadas e apreensão do conjunto transportador.",
        dependencies: ["DI Registrada.", "Veículo homologado pelo RNTRC."],
        outputs: ["Protocolo de Entrega digital."],
        relationship: "Alimenta a Planilha de Fretes e o Controle de Recebíveis."
    },
    7: {
        purpose: "Finalização do ciclo de vida do equipamento logístico.",
        execution: [
            "Vistoria de avarias no momento da desova.",
            "Transporte do container vazio até o Depot designado.",
            "Obtenção do EIR de devolução sem ressalvas."
        ],
        docs: ["EIR de Devolução", "Intercâmbio de Equipamento"],
        risks: ["Avaria não registrada previamente cobrada do transportador.", "Devolução em local incorreto."],
        impact: "Custos de Detention (diárias de container) e taxas de reparo abusivas.",
        dependencies: ["Desova da mercadoria concluída."],
        outputs: ["Baixa definitiva de responsabilidade sobre o equipamento."],
        relationship: "Crítico para o cálculo de margem líquida na Planilha de Custos."
    },
    8: {
        purpose: "Proteção da margem de lucro através do controle rigoroso de prazos.",
        execution: [
            "Contagem diária de dias de Free-Time.",
            "Alerta antecipado de 48h antes do vencimento de Storage.",
            "Negociação de extensões de prazo quando necessário."
        ],
        docs: ["Controle de Demurrage", "Tabela de Custos de Terminal"],
        risks: ["Esquecimento de prazo de devolução.", "Atraso no desembaraço aduaneiro."],
        impact: "Custo extra que pode superar o valor do próprio frete.",
        dependencies: ["Operação em curso iniciada."],
        outputs: ["Relatório de Prevenção de Perdas."],
        relationship: "Alerta automático no Painel de BI e Futuro x Débitos."
    },
    9: {
        purpose: "Garantia de qualidade e eliminação de passivos de responsabilidade.",
        execution: [
            "Checklist fotográfico de 360 graus.",
            "Assinatura colhida via tablet no ponto de entrega.",
            "Registro de ocorrências em tempo real no app de campo."
        ],
        docs: ["Relatório Fotográfico", "Checklist de Segurança"],
        risks: ["Pular etapa de registro de lacre.", "Falta de evidência física em caso de sinistro."],
        impact: "Impossibilidade de acionamento de seguro por falta de prova.",
        dependencies: ["Dispositivo móvel com acesso ao sistema."],
        outputs: ["Dossiê Final do Serviço."],
        relationship: "Fechamento do ciclo na Aba de Histórico e ECO.DOC."
    }
};

const OperationalManual: React.FC = () => {
    const { logAction } = useAppStore();
    const [selectedStep, setSelectedStep] = useState<number | null>(null);
    
    const [manualSteps] = useState([
        { icon: 'fa-map-marked-alt', title: '01. Ecossistema Portuário', desc: 'A logística portuária não é apenas movimento, é um sistema documental encadeado.' },
        { icon: 'fa-file-invoice-dollar', title: '02. Documentos Comerciais', desc: 'Invoice e Packing List definem o valor aduaneiro e a cubagem operacional.' },
        { icon: 'fa-file-contract', title: '03. Booking e BL', desc: 'Contrato-mãe. Sem o Bill of Lading correto, a carga não existe juridicamente.' },
        { icon: 'fa-ship', title: '04. Ciclo do Navio', desc: 'ETA e ETD ditam o ritmo. O tempo começa a contar na atracação.' },
        { icon: 'fa-warehouse', title: '05. Terminal Portuário', desc: 'Gate In/Out, pesagem e agendamento. O grande gargalo físico.' },
        { icon: 'fa-balance-scale', title: '06. Documentos Aduaneiros', desc: 'DI e DTA formalizam a entrada legal no território nacional.' },
        { icon: 'fa-truck', title: '07. Transporte Terrestre', desc: 'NF-e, CT-e e MDF-e. O caminhão exige conformidade para rodar.' },
        { icon: 'fa-boxes', title: '08. Depot e Vazio', desc: 'Gestão do equipamento após a desova. Inspeção e devolução rápida.' },
        { icon: 'fa-hourglass-half', title: '09. Prazos e Multas', desc: 'Demurrage e Storage: os custos invisíveis que destroem o lucro.' },
        { icon: 'fa-clipboard-check', title: '10. Checklist de Ouro', desc: 'Padronização total. Registro fotográfico e validação de lacres.' }
    ]);

    const details = selectedStep !== null ? STEP_DETAILS[selectedStep] : null;

    return (
        <section className="animate-fade-in py-4 max-w-[1600px] mx-auto pb-20 px-6 h-[calc(100vh-120px)] flex flex-col">
            <header className="text-center mb-8 shrink-0">
                <div className="inline-block px-4 py-1 bg-mec-red/20 text-mec-red rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-2 border border-mec-red/30">
                    survival guide v5.2 • DOUTRINA OPERACIONAL
                </div>
                <h3 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                    GUIA DE <span className="text-mec-red">SOBREVIVÊNCIA</span> PORTUÁRIA
                </h3>
            </header>

            <div className="flex flex-row gap-6 flex-1 overflow-hidden">
                
                {/* LEVEL 1: NAVIGATION CARDS (Left) */}
                <div className={`transition-all duration-500 ease-in-out overflow-y-auto custom-scrollbar pr-2 ${selectedStep !== null ? 'w-[40%]' : 'w-full max-w-4xl mx-auto'}`}>
                    <div className="space-y-4">
                        {manualSteps.map((step, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => {
                                    setSelectedStep(idx);
                                    logAction(`MANUAL: Analisando doutrina da etapa ${idx + 1}`);
                                }}
                                className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer group ${selectedStep === idx ? 'bg-mec-red border-mec-red shadow-[0_0_30px_rgba(225,6,0,0.3)] translate-x-2' : 'bg-bg-card border-white/5 hover:border-mec-red/50 hover:bg-white/5'}`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${selectedStep === idx ? 'bg-white text-mec-red' : 'bg-mec-red text-white'}`}>
                                    <i className={`fas ${step.icon} text-lg`}></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-black text-sm uppercase tracking-tight truncate ${selectedStep === idx ? 'text-white' : 'text-light'}`}>{step.title}</h4>
                                    <p className={`text-[10px] line-clamp-1 font-medium ${selectedStep === idx ? 'text-white/80' : 'text-gray-500'}`}>{step.desc}</p>
                                </div>
                                <i className={`fas fa-chevron-right text-xs transition-transform ${selectedStep === idx ? 'text-white rotate-90' : 'text-gray-700'}`}></i>
                            </div>
                        ))}
                    </div>
                </div>

                {/* LEVEL 2: TECHNICAL DOCTRINE PANEL (Right) */}
                <div className={`transition-all duration-500 ease-in-out ${selectedStep !== null ? 'w-[60%] opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}>
                    {details && (
                        <div className="h-full bg-bg-card border border-white/10 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-fade-in-right">
                            <header className="p-6 bg-white/5 border-b border-white/5 flex justify-between items-center">
                                <div>
                                    <span className="text-[9px] font-black text-mec-red uppercase tracking-[0.3em]">Manual Técnico v5.2</span>
                                    <h2 className="text-xl font-black text-light tracking-tight uppercase">{manualSteps[selectedStep!].title}</h2>
                                </div>
                                <button onClick={() => setSelectedStep(null)} className="w-10 h-10 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-all">
                                    <i className="fas fa-times"></i>
                                </button>
                            </header>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                                {/* 01. Purpose */}
                                <section>
                                    <h5 className="doc-label"><i className="fas fa-bullseye text-mec-red"></i> 01. Objetivo da Etapa</h5>
                                    <p className="text-sm text-gray-300 font-medium leading-relaxed">{details.purpose}</p>
                                </section>

                                <div className="grid grid-cols-2 gap-8">
                                    {/* 02. Execution */}
                                    <section>
                                        <h5 className="doc-label"><i className="fas fa-running text-mec-red"></i> 02. Execução Prática</h5>
                                        <ul className="space-y-2">
                                            {details.execution.map((item, i) => (
                                                <li key={i} className="text-[11px] text-gray-400 flex gap-2">
                                                    <span className="text-mec-red font-bold">{i+1}.</span> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </section>

                                    {/* 03. Documents */}
                                    <section>
                                        <h5 className="doc-label"><i className="fas fa-file-contract text-mec-red"></i> 03. Documentos Envolvidos</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {details.docs.map((doc, i) => (
                                                <span key={i} className="bg-bg-main border border-white/10 px-2 py-1 rounded text-[9px] font-black text-secondary uppercase">{doc}</span>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                {/* 04 & 05. Risks & Impact */}
                                <section className="p-6 bg-red-900/10 border border-mec-red/20 rounded-2xl">
                                    <div className="flex gap-8">
                                        <div className="flex-1">
                                            <h5 className="doc-label text-mec-red"><i className="fas fa-exclamation-triangle"></i> 04. Pontos Críticos</h5>
                                            <ul className="space-y-1">
                                                {details.risks.map((risk, i) => (
                                                    <li key={i} className="text-[10px] text-gray-300 font-bold flex gap-2">
                                                        <span className="text-mec-red">•</span> {risk}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="doc-label text-mec-red"><i className="fas fa-skull-crossbones"></i> 05. Impacto de Falha</h5>
                                            <p className="text-[10px] text-gray-400 italic leading-tight">"{details.impact}"</p>
                                        </div>
                                    </div>
                                </section>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* 06. Dependencies */}
                                    <div className="bg-bg-main p-4 rounded-xl border border-white/5">
                                        <h5 className="text-[9px] font-black text-gray-500 uppercase mb-2">06. Dependências</h5>
                                        <div className="flex flex-wrap gap-1">
                                            {details.dependencies.map((d, i) => <span key={i} className="text-[9px] font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded">[{d}]</span>)}
                                        </div>
                                    </div>
                                    {/* 07. Outputs */}
                                    <div className="bg-bg-main p-4 rounded-xl border border-white/5">
                                        <h5 className="text-[9px] font-black text-gray-500 uppercase mb-2">07. Entregas (Outputs)</h5>
                                        <div className="flex flex-wrap gap-1">
                                            {details.outputs.map((o, i) => <span key={i} className="text-[9px] font-bold text-success bg-success/5 px-2 py-0.5 rounded">→ {o}</span>)}
                                        </div>
                                    </div>
                                </div>

                                {/* 08. Integration */}
                                <section className="border-t border-white/5 pt-6">
                                    <h5 className="doc-label"><i className="fas fa-project-diagram text-mec-red"></i> 08. Relação com o Ecossistema ECO</h5>
                                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl text-xs font-bold text-primary flex items-center gap-3">
                                        <i className="fas fa-microchip"></i>
                                        {details.relationship}
                                    </div>
                                </section>
                            </div>

                            <footer className="p-4 bg-mec-red text-center">
                                <button className="text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center justify-center gap-3 w-full">
                                    <i className="fas fa-graduation-cap"></i> Validar Conhecimento da Etapa
                                </button>
                            </footer>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .doc-label { 
                    font-size: 10px; font-weight: 900; text-transform: uppercase; 
                    letter-spacing: 0.2em; color: #64748b; margin-bottom: 12px; 
                    display: flex; align-items: center; gap: 8px;
                }
                @keyframes fade-in-right {
                    from { opacity: 0; transform: translateX(30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-fade-in-right {
                    animation: fade-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(var(--color-primary-val), 0.1);
                    border-radius: 10px;
                }
            `}</style>
        </section>
    );
};

export default OperationalManual;
