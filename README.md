# Ecolog Enterprise - Sistema Logístico

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

Uma plataforma completa de gestão logística desenvolvida com React e TypeScript, projetada para otimizar processos de coleta, transporte e entrega.

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 19.2.3 + TypeScript
- **Build Tool**: Vite 7.3.0
- **Charts**: Chart.js + react-chartjs-2
- **AI Integration**: Google Generative AI
- **Real-time**: Socket.IO Client
- **Styling**: CSS Modules + Tailwind CSS

## 📋 Funcionalidades Principais

- **Gestão de Pedidos**: Criação, acompanhamento e gerenciamento de ordens
- **Rastreamento em Tempo Real**: Monitoramento GPS de frotas
- **Portal do Motorista**: Aplicativo para check-in e prova de entrega
- **Dashboard Analytics**: Visualização de métricas e KPIs operacionais
- **Sistema de Cotações**: Cálculo automático de tarifas
- **Gestão de Documentos**: Upload e validação de NF-e, CT-e

## 🛠️ Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Chave de API do Google Gemini AI

## 📦 Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/ecolog-enterprise.git
   cd ecolog-enterprise
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env.local
   # Edite .env.local com sua GEMINI_API_KEY
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Abra http://localhost:5173 no seu navegador

## 🏗️ Estrutura do Projeto

```
├── src/
│   ├── components/     # Componentes React reutilizáveis
│   ├── hooks/         # Hooks personalizados
│   ├── services/      # Serviços de API e integrações
│   ├── types.ts       # Definições de tipos TypeScript
│   ├── utils/         # Funções utilitárias
│   └── styles/        # Estilos globais
├── public/            # Arquivos estáticos
└── docs/             # Documentação técnica
```

## 📊 Documentação Técnica

Para detalhes completos sobre arquitetura, API e roadmap, consulte:
- [Fluxo Logístico Completo](./fluxo-logistico-app.md)

## 🚀 Deploy

O projeto está configurado para deploy em:
- **Vercel**: Configuração automática para frontend
- **Netlify**: Build otimizado e deploy contínuo
- **Docker**: Containerização para produção

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona NovaFuncionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Contate a equipe de desenvolvimento

---

**Desenvolvido com ❤️ pela equipe Ecolog Enterprise**
