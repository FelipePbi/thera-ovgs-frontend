# Sistema de Gestão de Ordens de Venda (Frontend)

Solução frontend do desafio técnico **Thera - OVGS**, focada no ciclo de vida operacional de Ordens de Venda (OVs): cadastros, criação, acompanhamento, agendamento, monitoramento e auditoria.

> Este repositório cobre o perfil **Front-end**. A API, a persistência e parte das regras de domínio são **simuladas em memória** com [Mock Service Worker (MSW)](#api-mockada-msw).


### Screenshots

![Monitoramento](https://github.com/FelipePbi/thera-ovgs-frontend/blob/main/images/image.png)

---

## Aderência ao desafio (perfil Front-end)

| Requisito do Desafio | Status | Onde aparece |
| --- | --- | --- |
| Gestão de Ordens de Venda (criar, listar, detalhar, atualizar status) | Atendido | `/pedidos`, `/pedidos/nova`, `/pedidos/[id]` |
| Monitoramento operacional com filtros por status, cliente, tipo de transporte e data | Atendido | `/monitoramento` (intervalo `de`/`até` na data agendada) |
| Central de Agendamento (data, janela, confirmação, reagendamento) | Atendido | Fluxo no **detalhe do pedido** (`/pedidos/[id]`), sem tela dedicada |
| Cadastros: clientes (criar/editar/consultar), tipos de transporte (criar/editar/consultar), itens (criar/consultar) | Atendido | `/cadastros/*` (itens também permitem editar/excluir) |
| Integração com APIs (mock permitido) | Atendido | Axios + MSW em `/api/*` |
| Tratamento de estados | Atendido | Loading com skeletons, toasts de erro/sucesso, guards de auth |
| Validações de entrada | Atendido | Zod + regras na UI e no MSW |
| Auditoria mínima (criação, status, agendamento, transporte) | Atendido | `/registro` + wrappers `withAudit` no MSW |

**Fora do recorte deste frontend:** NestJS, banco relacional, ORM e Docker Compose (exigências do perfil back-end / full stack).

---

## Diferenciais além do desafio

Implementações que vão além do mínimo pedido no PDF e reforçam governança/UX:

- **Autenticação JWT mock** (`/login`, `AuthGuard`, interceptor 401, limpeza de cache no login/logout)
- **Validação de peso total × capacidade** do tipo de transporte (UI + MSW)
- **Confirmação obrigatória** do agendamento antes de `EM_TRANSPORTE`
- **Data de entrega** (`deliveredAt`) ao marcar `ENTREGUE`
- **Troca de tipo de transporte** em OV existente (somente transportes autorizados do cliente)
- **Auditoria com usuário responsável** (`userId` / `username` no log)
- **KPIs** (total, em transporte, atrasadas) e filtros avançados no monitoramento
- **Skeletons** de loading, delay simulado de **600 ms** no MSW e toasts
- **Redux Saga** para resetar transporte ao trocar cliente no rascunho da OV
- **CI/CD** entrega continua configurada na vercel

---

## Regras de negócio

### Fluxo de status (unidirecional)

```text
CRIADA → PLANEJADA → AGENDADA → EM_TRANSPORTE → ENTREGUE
```

Transições fora da sequência são rejeitadas na UI e no MSW (`409`).

### Criação de OV

- 1 cliente, 1 tipo de transporte e **≥ 1 item**
- Transporte deve estar em `authorizedTransportTypes` do cliente
- Peso total dos itens **≤ capacidade** do transporte

### Agendamento

- Disponível em `PLANEJADA` (agendar) e `AGENDADA` (reagendar)
- Data **não pode ser passada**
- Janelas fixas: `08:00-12:00`, `13:00-18:00`, `18:00-22:00`
- Confirmar agendamento seta `scheduleConfirmed = true`
- Reagendar **reseta** a confirmação
- `EM_TRANSPORTE` exige agendamento confirmado

---

## Stack

| Tecnologia | Uso |
| --- | --- |
| Next.js `14.2` (App Router) + React `18` + TypeScript | SPA / rotas |
| TanStack Query `5` | Server state (listagens, mutações, cache) |
| Redux Toolkit + Redux Saga | Rascunho da OV e regra cliente ↔ transporte |
| Axios | Cliente HTTP (`baseURL: /api`) |
| Zod (+ React Hook Form em login/cadastros) | Validação; criação de OV usa Redux + Zod |
| Tailwind CSS + shadcn/ui | UI |
| MSW `2` | API mock no browser (dev e produção/Vercel) |
| Jest + Testing Library | Testes unitários/integração |

---

## Arquitetura

### Separação de estado

- **TanStack Query:** dados da API, cache (`staleTime: 60s`), invalidação após mutações
- **Redux + Saga:** draft da nova OV; ao trocar cliente, o Saga remove transporte não autorizado
- **React Context (`AuthProvider`):** sessão JWT em `localStorage`

### Providers

```text
MswProvider → QueryProvider → ReduxProvider → AuthProvider
```

### Estrutura de pastas (Feature-Sliced Design)

```text
src/
├── app/                 # Rotas (login + dashboard)
├── features/
│   ├── auth/            # Login, guard, storage
│   ├── orders/          # OV, agendamento, monitoramento
│   └── registry/        # Clientes, transportes, itens
├── mocks/               # MSW: handlers, db, auth, audit
├── store/               # Redux + Saga
├── lib/                 # api, types, providers
├── components/          # DataTable, Sidebar, skeletons, UI kit
└── utils/               # Formatters
```

### Persistência e auditoria (mock)

- Banco em memória com seeds (`src/mocks/db.ts`)
- Mutações bem-sucedidas passam por `withAudit` e gravam log com data/hora, ação, entidade, old/new e usuário
- Delay padrão de **600 ms** em todas as rotas mockadas

---

## Rotas

| Rota | Função |
| --- | --- |
| `/login` | Login (público) |
| `/` | Redirect → `/monitoramento` |
| `/monitoramento` | KPIs + lista filtrável |
| `/pedidos` | Lista, filtros e ações rápidas |
| `/pedidos/nova` | Criação de OV |
| `/pedidos/[id]` | Detalhe, status, agendamento, transporte |
| `/cadastros` | Redirect → `/cadastros/clients` |
| `/cadastros/clients` | CRUD clientes |
| `/cadastros/transport-types` | CRUD tipos de transporte |
| `/cadastros/items` | CRUD itens |
| `/registro` | Timeline de auditoria |

---

## API mockada (MSW)

Prefixo: `/api`. Em geral exige `Authorization: Bearer <token>` (exceto `POST /auth/login`).

| Grupo | Endpoints |
| --- | --- |
| Auth | `POST /auth/login`, `GET /auth/me` |
| Cadastros | CRUD `/clients`, `/transport-types`, `/items` |
| Pedidos | `GET/POST /orders`, `GET /orders/:id`, `PATCH .../status`, `.../schedule`, `.../confirm-schedule`, `.../transport-type` |
| Monitoramento | `GET /dashboard/kpis` |
| Auditoria | `GET /audit-logs` |

Filtros de `GET /orders`: `status`, `clientId`, `transportTypeId`, `scheduledDateFrom`, `scheduledDateTo`, `page`, `limit`.

O `MswProvider` inicia o Service Worker no browser em **qualquer ambiente** (incluindo Vercel / `next start`), usando `public/mockServiceWorker.js`. Sem isso, as chamadas `/api/*` retornariam 404 no host Next.js.

Para apontar a um backend real no futuro: desligar o MSW em `MswProvider` e configurar o `baseURL` em `src/lib/api.ts`.

---

## Como executar

### Pré-requisitos

- Node.js **18+**
- npm

### Desenvolvimento

```bash
git clone https://github.com/FelipePbi/thera-ovgs-frontend.git
cd thera-ovgs-frontend
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Credenciais de teste

| Campo | Valor |
| --- | --- |
| Usuário | `teste` |
| Senha | `123456` |

O MSW sobe automaticamente no browser (dev, `next start` e deploy na Vercel) e injeta seeds (clientes, transportes, itens, pedidos e logs).

### Scripts

| Script | Uso |
| --- | --- |
| `npm run dev` | Desenvolvimento (com MSW) |
| `npm run build` | Build de produção |
| `npm run start` | Serve o build (com MSW no browser) |
| `npm run lint` | ESLint |
| `npm run test` | Jest |
| `npm run test:watch` | Jest em watch mode |

---

## Testes

Cobertura focada em regras críticas (6 arquivos / 12 casos):

| Arquivo | Cenário |
| --- | --- |
| `OrderForm.test.tsx` | Bloqueio de submit (transporte não autorizado / peso excedido) |
| `schemas.test.ts` | Peso total e capacidade |
| `stateMachine.test.ts` | Próximo status e transição inválida |
| `orderSaga.test.ts` | Reset de transporte ao trocar cliente |
| `draftOrderSlice.test.ts` | Reducer do draft |
| `formatters.test.ts` | Formatação de data/moeda |

```bash
npm run test
```

---

## Escalabilidade, performance e trade-offs

**Pontos positivos**

- Separação server/client state evita Redux como “cache de API”
- MSW no nível de rede permite trocar o mock por API real com mínimo impacto nos serviços
- Cache de 60 s + invalidação após mutações equilibra fluidez e consistência
- Organização por feature facilita manutenção por domínio

**Limitações conscientes**

- Dados em memória: recarregar a página restaura os seeds
- JWT mock (assinatura simplificada) e usuário único de demonstração
- Listagens usam `limit: 50` fixo (API já aceita paginação)
- Sidebar oculta em mobile (`md+`)
- Sem integridade referencial rígida ao excluir cadastros referenciados
- Persistência só no Service Worker da sessão: refresh restaura seeds; não há backend compartilhado entre usuários

---

## Licença

MIT — ver `LICENSE`.
