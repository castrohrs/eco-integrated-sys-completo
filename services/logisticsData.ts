
import { Port, LogisticsCarrier } from '../types';

export interface PortTerminal {
    name: string;
    url: string;
    type: 'CHEIO' | 'VAZIO' | 'AMBOS';
}

export interface EnhancedPort extends Port {
    terminals: PortTerminal[];
}

// Ponto de Referência: Porto do Rio de Janeiro
export const RJ_COORDS = { lat: -22.8959, lng: -43.1822 };

export const PORTS_DATABASE: EnhancedPort[] = [
    {
        id: 'BRRIO',
        name: 'Porto do Rio de Janeiro',
        city: 'Rio de Janeiro',
        state: 'RJ',
        address: 'Rua do Acre, 21, Centro, Rio de Janeiro - RJ',
        lat: -22.8959,
        lng: -43.1822,
        type: 'Marítimo',
        terminals: [
            { name: 'MultiRio', url: 'https://www.multirio.com.br/janelas-disponiveis', type: 'AMBOS' },
            { name: 'ICTSI Rio Brasil', url: 'https://www.riobrasilterminal.com', type: 'AMBOS' },
            { name: 'Triunfo Logística', url: 'https://www.triunfologitica.com.br', type: 'AMBOS' }
        ],
        carriers: []
    },
    {
        id: 'BRSSZ',
        name: 'Porto de Santos',
        city: 'Santos',
        state: 'SP',
        address: 'Av. Conselheiro Nébias, Centro, Santos - SP',
        lat: -23.9608,
        lng: -46.3332,
        type: 'Marítimo',
        terminals: [
            { name: 'BTP - Brasil Terminal Portuário', url: 'https://agendamento.btpsantos.com.br', type: 'AMBOS' },
            { name: 'Santos Brasil (Tecon)', url: 'https://agendamento.santosbrasil.com.br', type: 'AMBOS' },
            { name: 'DP World Santos', url: 'https://agendamento.dpworldsantos.com.br', type: 'AMBOS' },
            { name: 'Ecoporto', url: 'https://www.ecoportal.com.br', type: 'AMBOS' }
        ],
        carriers: []
    },
    {
        id: 'BRITG',
        name: 'Porto de Itaguaí',
        city: 'Itaguaí',
        state: 'RJ',
        address: 'Estrada da Ilha da Madeira, s/n',
        lat: -22.9231,
        lng: -43.8647,
        type: 'Marítimo',
        terminals: [
            { name: 'Sepetiba Tecon', url: 'https://www.sepetibatecon.com.br', type: 'AMBOS' }
        ],
        carriers: []
    },
    {
        id: 'BRNAV',
        name: 'Porto de Navegantes',
        city: 'Navegantes',
        state: 'SC',
        address: 'Rua Portonave, 01',
        lat: -26.8972,
        lng: -48.6475,
        type: 'Marítimo',
        terminals: [
            { name: 'Portonave', url: 'https://www.portonave.com.br/pt-br/clientes/agendamento', type: 'AMBOS' }
        ],
        carriers: []
    },
    {
        id: 'BRPNG',
        name: 'Porto de Paranaguá',
        city: 'Paranaguá',
        state: 'PR',
        address: 'Rua Antônio Pereira, 161',
        lat: -25.5011,
        lng: -48.5103,
        type: 'Marítimo',
        terminals: [
            { name: 'TCP - Terminal de Containers', url: 'https://agendamento.tcp.com.br', type: 'AMBOS' }
        ],
        carriers: []
    }
];
