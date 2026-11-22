# 📐 Especificação do Sistema: Gerador de Propostas Comerciais (Drafto / Espalha.ai)

## 1. Visão Geral do Projeto

A aplicação web tem como objetivo permitir a criação, edição, gestão e exportação (PDF) de propostas comerciais para credenciamento e gestão de eventos, padronizando o layout, o fluxo financeiro, a lista de recursos/equipamentos e as condições contratuais.

---

## 2. Estrutura de Dados & Modelos (Data Schema)

A proposta é dividida em **5 blocos principais**:

### 2.1. Cabeçalho / Informações do Evento

- **Título da Proposta / Evento** (ex: _Evento Lançamento_)

- **Subtítulo / Descrição Resumida**

- **Data do Evento**

- **Local do Evento**

- **Público Estimado** (ex: _500 pessoas_)

### 2.2. Dados do Cliente e Emissão

- **Nome do Contratante / Razão Social**

- **Endereço Completo**

- **CNPJ / CPF**

- **Referência / Contato no Cliente**

- **Código do Cliente** (ex: _CL1909.0180_)

- **Data de Emissão da Proposta**

### 2.3. Escopo do Serviço & Equipamentos

- **Descrição da Solução Proposta** (Texto descritivo geral)

- **Recursos do Sistema de Credenciamento** (Lista com Ícone/Título + Descrição):

- Importação de participantes

- Etiquetas personalizadas

- Identificação prioritária

- Entrega de kits

- Chapelaria

- Controle de acesso

- Inscrições no local

- Dashboard em tempo real

- **Autoatendimento e Equipamentos** (Lista de itens / checklist técnico):

- Quantidade e especificações técnicas de totens/computadores (ex: _05 totens, tela 15,6", Ryzen 5, 16GB RAM, etc._)

- Funcionalidades do app do totem (Interface Full HD, leitura de QR Code/CPF/nome)

### 2.4. Condições Comerciais & Pagamento

- **Tabela / Resumo Financeiro**:

- Descrição do Pacote Principal

- Valor Total (R$)

- Cronograma de Parcelamento (Data de vencimento + Valor individual)

- **Regras Comerciais**:

- Forma de pagamento (ex: Boleto bancário)

- Validade da Proposta

- Custos incluídos (Impostos, frete, montagem/desmontagem)

### 2.5. Requisitos Operacionais & Rodapé Contratual

- **Requisitos Pré-Evento** (Internet mínima, envio de bases de dados, energia elétrica)

- **Compromisso da Empresa / Disclaimers**

- **Campos para Aceite do Contratante** (Assinatura, Nome/Cargo e Data)

---

## 3. Requisitos Funcionais (Módulos da Aplicação Web)

### 3.1. Painel de Gestão de Propostas (Dashboard)

- **Lista de Propostas**: Visualização por status (Rascunho, Enviada, Aprovada, Recusada, Expirada).
- **Filtros e Busca**: Por cliente, código de cliente, intervalo de datas ou título do evento.

- **Ações**: Criar nova proposta, duplicar proposta existente, editar, gerar link/PDF e excluir.

### 3.2. Formulário Dinâmico de Criação / Edição

- **Wizard / Passos Sequenciais**:

1. **Passo 1**: Dados do Evento e do Cliente

2. **Passo 2**: Seleção de Módulos do Sistema e Equipamentos (com checkboxes e campos editáveis)

3. **Passo 3**: Valores, Condições de Pagamento e Datas

4. **Passo 4**: Requisitos Operacionais e Pré-visualização

- **Templates Reutilizáveis**: Opção de salvar "Pacotes Padrão" (ex: _Evento até 500 pessoas_, _Evento VIP_, _Congresso Grande Porte_) para preencher os itens automaticamente.

### 3.3. Motor de Renderização de PDF e Preview em Tempo Real

- **Editor / Visualização Dividida (Split Screen)**: Conforme o usuário preenche os campos à esquerda, o documento à direita é atualizado em tempo real.
- **Gerador de PDF (PDF Export)**:
- Preservar a identidade visual do modelo original (apresentação e recursos, requisitos de preparação, valores/aceite e condições) com paginação A4 dinâmica; a página de valores sempre começa em uma nova página. Na implementação atual, o template HTML/CSS compartilhado alimenta preview, link público e PDF.

- Cabeçalho/Rodapé padronizados com logo da empresa e numeração de página.

### 3.4. Gestão de Projetos e Documentos Markdown

- **Cadastro de Projeto**: nome, breve descrição e vínculo obrigatório com um cliente cadastrado.
- **Documentos anexos**: cada projeto pode ter vários documentos em formato Markdown, com título e conteúdo.
- **Editor Markdown**: escrita direta no painel, importação de arquivos `.md`/`.markdown` e download do documento como `.md`.
- **Listagem e busca**: localização de projetos por nome, descrição, cliente ou código do cliente.
- **Integridade**: o cliente só pode ser excluído se não possuir propostas ou projetos vinculados; excluir o projeto remove seus documentos anexos.

Detalhes de implementação em [Projetos e documentos Markdown](./projetos.md).

---

## 4. Arquitetura e Tecnologias Recomendadas

| Camada             | Tecnologia Recomendada                           | Justificativa                                                                                                     |
| ------------------ | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| **Frontend**       | React.js / Next.js + Tailwind CSS                | Permite criar formulários reativos e estilização idêntica ao design system do PDF.                                |
| **Backend**        | Node.js (NestJS / Express) ou Python (FastAPI)   | Leve, rápido e ideal para lidar com templates e regras de negócio.                                                |
| **Geração de PDF** | Puppeteer (HTML -> PDF) ou `@react-pdf/renderer` | Garante que o layout desenhado em HTML/CSS seja convertido exatamente em PDF com fidelidade visual pixel-perfect. |
| **Banco de Dados** | PostgreSQL ou MongoDB                            | Para armazenar o histórico de clientes, propostas, modelos de equipamentos e valores.                             |

---

## 5. Próximos Passos Sugeridos

1. **Definição da Identidade Visual**: Definir as cores institucionais (como o verde/preto do modelo), fontes e logotipos padrão.

2. **Criação do Protótipo de Tela (Figma)**: Desenhar o formulário de entrada e a página de listagem.
3. **Desenvolvimento da API de PDFs**: Criar o modelo HTML/CSS idêntico à proposta anexada e parametrizar as variáveis (como `{{nome_cliente}}`, `{{valor_total}}`, `{{lista_equipamentos}}`).
