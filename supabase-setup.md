# Guia de Configuração do Supabase

## 🚀 Passos para Configurar o Banco de Dados

### 1. Acessar o Supabase
- Vá para: https://ssgugrjcznwkxmtynwpp.supabase.co
- Faça login com suas credenciais

### 2. Executar o Schema SQL

1. **No painel do Supabase**, vá para **SQL Editor**
2. **Clique em "New query"**
3. **Copie e cole** todo o conteúdo do arquivo `database-schema.sql`
4. **Clique em "Run"** para executar o schema

### 3. Configurar Autenticação

1. **Vá para Authentication > Settings**
2. **Configure os seguintes provedores:**
   - ✅ Email (já ativado por padrão)
   - 📱 Phone (opcional, para login via SMS)
   - 🔐 Social (Google, GitHub, etc - opcional)

3. **Configure as URLs de redirecionamento:**
   ```
   http://localhost:5173
   https://eco-integrated-sys-completo.vercel.app
   ```

### 4. Configurar Row Level Security (RLS)

O schema já inclui políticas básicas de RLS. Para ajustar:

1. **Vá para Authentication > Policies**
2. **Revise as políticas criadas** automaticamente
3. **Ajuste conforme necessário** para sua organização

### 5. Configurar Storage (Upload de Arquivos)

1. **Vá para Storage**
2. **Crie os seguintes buckets:**
   - `documents` - Para documentos fiscais (NF-e, CT-e)
   - `photos` - Para fotos de check-in e POD
   - `signatures` - Para assinaturas digitais
   - `attachments` - Para anexos gerais

3. **Configure as políticas de acesso** para cada bucket

### 6. Configurar API Keys

As chaves já estão configuradas no projeto:
- **URL**: `https://ssgugrjcznwkxmtynwpp.supabase.co`
- **Anon Key**: Já configurada no `supabaseClient.ts`

### 7. Testar Conexão

1. **Inicie o projeto localmente:**
   ```bash
   npm run dev
   ```

2. **Verifique o console** para mensagens de conexão com Supabase

3. **Teste o cadastro/login** no sistema

## 📋 Estrutura das Tabelas Criadas

### Tabelas Principais
- `users` - Usuários do sistema
- `customers` - Clientes e parceiros
- `orders` - Pedidos de serviço
- `quotes` - Cotações
- `vehicles` - Veículos da frota
- `drivers` - Motoristas

### Tabelas Operacionais
- `pickups` - Coletas agendadas
- `shipments` - Embarques/remessas
- `tracking_events` - Eventos de rastreamento GPS
- `proof_of_delivery` - Prova de entrega (POD)

### Tabelas Financeiras
- `financial_records` - Registros financeiros
- `invoices` - Faturas

### Tabelas de Gestão
- `demands` - Demandas e serviços
- `maintenance_tasks` - Manutenção de veículos
- `notifications` - Notificações do sistema
- `chat_messages` - Chat interno

## 🔧 Configurações Adicionais

### Webhooks (Opcional)
Configure webhooks para:
- Notificações de novo pedido
- Atualizações de status
- Alertas de sistema

### Backup Automático
1. **Vá para Settings > Database**
2. **Configure backups automáticos**
3. **Defina retenção** recomendada: 30 dias

### Monitoramento
1. **Vá para Logs**
2. **Monitore queries lentas**
3. **Configure alertas** de erro

## 🚨 Importante

### Segurança
- **Nunca exponha a service key** no frontend
- **Use apenas a anon key** no cliente
- **Configure RLS** adequadamente

### Performance
- **Os índices já foram criados** no schema
- **Monitore o desempenho** das queries
- **Use pagination** para grandes volumes de dados

### Escalabilidade
- **Considere upgrade do plano** conforme crescimento
- **Monitore os limites** de bandwidth e storage
- **Configure CDN** para arquivos estáticos

## 🆘 Suporte

Se encontrar problemas:
1. **Verifique os logs** no Supabase
2. **Teste as queries** no SQL Editor
3. **Revise as políticas RLS**
4. **Consulte a documentação** do Supabase

---

**Pronto!** Seu banco de dados está configurado e o sistema está pronto para uso com persistência completa.
