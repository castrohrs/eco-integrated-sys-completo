
import React from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { useAuth } from '../hooks/useAuth';
import Dashboard from './Dashboard';
import OperationalManual from './OperationalManual';
import SystemDocs from './SystemDocs';
import Manifesto from './Manifesto';
import EcoMaps from './EcoMaps';
import EcoContainer from './EcoContainer';
import FinanceMasterSheet from './FinanceMasterSheet'; 
import AdvncContabil from './AdvncContabil';
import GeneralApprovals from './GeneralApprovals';
import AnalyticalDashboard from './AnalyticalDashboard';
import FuturoDebitos from './FuturoDebitos';
import OperationalReport from './OperationalReport';
import { OperationalCalendar, OperationalCostRadar, AccountDelayReport, InterestPaidReport, ReimbursementForm } from './Operational';
import FreightQuotation from './FreightQuotation';
import FreightSheet from './FreightSheet';
import DemandDashboard from './DemandDashboard';
import BriefingFeedback from './BriefingFeedback';
import FleetControl from './FleetControl';
import PortChecklist from './PortChecklist';
import CteReader from './CteReader';
import ContainerReceipt from './ContainerReceipt';
import GestaoPredial from './GestaoPredial';
import RegistrationControl from './RegistrationControl';
import Compliance from './Compliance';
import EcoSites from './EcoSites';
import MobileMenuBuilder from './MobileMenuBuilder';
import EcoFiles from './EcoFiles';
import EcoDrive from './EcoDrive';
import OcrReader from './OcrReader';
import History from './History';
import EcoNote from './EcoNote';
import EcoAgenda from './EcoAgenda';
import DadosGeraisPg from './DadosGeraisPg';
import EcoDoc from './EcoDoc';
import EcoMec from './EcoMec';
import CollaboratorRegistration from './CollaboratorRegistration';
import EcoServices from './EcoServices'; // Importando o novo componente

const AccessDenied = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-10 animate-fade-in">
        <div className="w-24 h-24 bg-danger/10 border border-danger/20 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-danger/10">
            <i className="fas fa-user-shield text-4xl text-danger"></i>
        </div>
        <h2 className="text-3xl font-black text-light mb-4">Acesso Restrito</h2>
        <p className="text-gray-text max-w-md text-lg leading-relaxed">
            Sua conta não possui privilégios hierárquicos ou vínculo de setor para visualizar este módulo.
        </p>
        <div className="mt-8 p-4 bg-bg-card rounded-lg border border-border-color text-xs font-mono text-gray-500 uppercase tracking-widest">
            ERROR_CODE: 403_GOVERNANCE_LOCK
        </div>
    </div>
);

const FeatureTabs: React.FC = () => {
    const { 
        activeTab, 
        checkPermission,
        freightSheetData, 
        addFreightSheetItem, 
        updateFreightSheetItem, 
        deleteFreightSheetItem,
        clientNotes,
        addClientNote,
    } = useAppStore();
    const { currentUser } = useAuth();

    const hasPermission = checkPermission(currentUser, activeTab);

    const getTabClassName = (tabId: string) => {
        const baseClass = 'w-full transition-opacity duration-300 ease-in-out h-full';
        const activeClass = 'opacity-100 flex flex-col';
        const inactiveClass = 'opacity-0 pointer-events-none absolute top-0 left-0';
        return `${baseClass} ${activeTab === tabId ? activeClass : inactiveClass}`;
    }

    if (!hasPermission) {
        return <AccessDenied />;
    }

    return (
        <div className="relative min-h-[70vh] flex flex-col flex-1">
            <div className={getTabClassName('system-docs')}><SystemDocs /></div>
            <div className={getTabClassName('operational-manual')}><OperationalManual /></div>
            <div className={getTabClassName('dashboard')}><Dashboard /></div>
            <div className={getTabClassName('operational-calendar')}><OperationalCalendar /></div>
            <div className={getTabClassName('manifesto')}><Manifesto /></div>
            <div className={getTabClassName('eco-maps')}><EcoMaps /></div>
            <div className={getTabClassName('tracking-scheduling')}><EcoContainer /></div>
            <div className={getTabClassName('eco-doc')}><EcoDoc /></div>
            <div className={getTabClassName('eco-finance')}><FinanceMasterSheet /></div>
            <div className={getTabClassName('advnc-contabil')}><AdvncContabil /></div>
            <div className={getTabClassName('general-approvals')}><GeneralApprovals /></div>
            <div className={getTabClassName('analytical-dashboard')}><AnalyticalDashboard /></div>
            <div className={getTabClassName('futuro-debitos')}><FuturoDebitos /></div>
            <div className={getTabClassName('operational-report')}><OperationalReport /></div>
            <div className={getTabClassName('cost-radar')}><OperationalCostRadar /></div>
            <div className={getTabClassName('account-delays')}><AccountDelayReport /></div>
            <div className={getTabClassName('interest-reports')}><InterestPaidReport /></div>
            <div className={getTabClassName('reimbursement')}><ReimbursementForm /></div>
            <div className={getTabClassName('freight-quotation')}><FreightQuotation /></div>
            <div className={getTabClassName('freight-sheet')}>
                <FreightSheet 
                    fretes={freightSheetData}
                    onAddFrete={addFreightSheetItem}
                    onUpdateFrete={updateFreightSheetItem}
                    onDeleteFrete={deleteFreightSheetItem}
                    clientNotes={clientNotes}
                    onAddClientNote={addClientNote}
                    onOpenDetailModal={() => {}}
                />
            </div>
            <div className={getTabClassName('eco-services')}><EcoServices /></div>
            <div className={getTabClassName('eco-mec')}><EcoMec /></div>
            <div className={getTabClassName('briefing')}><DemandDashboard /></div>
            <div className={getTabClassName('briefing-feedback')}><BriefingFeedback /></div>
            <div className={getTabClassName('fleet-control')}><FleetControl /></div>
            <div className={getTabClassName('port-checklist')}><PortChecklist /></div>
            <div className={getTabClassName('cte-reader')}><CteReader /></div>
            <div className={getTabClassName('container-receipt')}><ContainerReceipt /></div>
            <div className={getTabClassName('gestao-predial')}><GestaoPredial /></div>
            <div className={getTabClassName('registration-control')}><RegistrationControl /></div>
            <div className={getTabClassName('compliance')}><Compliance /></div>
            <div className={getTabClassName('eco-sites')}><EcoSites /></div>
            <div className={getTabClassName('mobile-builder')}><MobileMenuBuilder /></div>
            <div className={getTabClassName('eco-files')}><EcoFiles /></div>
            <div className={getTabClassName('eco-drive')}><EcoDrive /></div>
            <div className={getTabClassName('ocr-reader')}><OcrReader /></div>
            <div className={getTabClassName('history')}><History /></div>
            <div className={getTabClassName('collaborator-registration')}><CollaboratorRegistration /></div>
            <div className={getTabClassName('eco-note')}><EcoNote /></div>
            <div className={getTabClassName('eco-agenda')}><EcoAgenda /></div>
            <div className={getTabClassName('dados-gerais-pg')}><DadosGeraisPg /></div>
            <div className={getTabClassName('conexao')}>
                <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4 animate-fade-in">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                        <i className="fas fa-satellite-dish text-4xl text-primary animate-pulse"></i>
                    </div>
                    <h2 className="text-3xl font-bold text-light">Conexão Neural Estabelecida</h2>
                </div>
            </div>
        </div>
    );
};

export default FeatureTabs;
