# Plano de desenvolvimento — Gerador de Propostas Comerciais

Com base na especificação, a ferramenta deve permitir **criar, editar, acompanhar e exportar propostas comerciais em PDF**, padronizando informações do evento, serviços, equipamentos, valores e condições.

## 1. Funcionalidades previstas

### 1.1. Gestão de propostas

- Listar propostas e consultar seu status: **rascunho, enviada, aprovada, recusada ou expirada**.
- Buscar e filtrar por cliente, código do cliente, período ou título do evento.
- Criar, editar, duplicar e excluir propostas.
- Gerar PDF e link para compartilhar a proposta.

### 1.2. Criação e edição

O cadastro será dividido em quatro etapas:

1. **Evento e cliente**
   - Título, descrição, data, local e público estimado.
   - Contratante, endereço, CNPJ/CPF, contato, código do cliente e data de emissão.

2. **Serviços e equipamentos**
   - Descrição da solução.
   - Seleção dos recursos de credenciamento, como importação de participantes, etiquetas, identificação prioritária, entrega de kits, chapelaria, controle de acesso, inscrições no local e dashboard.
   - Inclusão e edição de equipamentos, quantidades e especificações.
   - Registro das funcionalidades do app de autoatendimento.

3. **Valores e condições comerciais**
   - Pacote principal e valor total.
   - Parcelas com valores e datas de vencimento.
   - Forma de pagamento, validade e custos incluídos.

4. **Operação e revisão**
   - Requisitos pré-evento, como internet, bases de dados e energia.
   - Compromissos e avisos contratuais.
   - Pré-visualização da proposta e campos de aceite do contratante.

### 1.3. Modelos reutilizáveis

- Salvar pacotes padrão de serviços e equipamentos.
- Aplicar modelos para preencher propostas, por exemplo, “Evento até 500 pessoas”, “Evento VIP” ou “Congresso Grande Porte”.

### 1.4. Pré-visualização e PDF

- Atualizar a visualização conforme os dados são preenchidos.
- Exportar PDF mantendo o padrão visual de **três páginas**:
  1. Apresentação e recursos;
  2. Requisitos de preparação;
  3. Valores, aceite e condições.
- Incluir logo, cabeçalho, rodapé e numeração das páginas.

### 1.5. Gestão de projetos

- Cadastrar projetos com nome, breve descrição e cliente vinculado.
- Anexar vários documentos em Markdown a cada projeto.
- Editar o conteúdo no painel, importar arquivos `.md`/`.markdown` e baixar o documento em Markdown.
- Buscar projetos por nome, descrição, cliente ou código do cliente.
- Impedir a exclusão de clientes com propostas ou projetos vinculados.

---

## 2. Etapas do projeto

| Etapa                                   | Atividades principais                                                                           | Entregáveis                                       |
| --------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| **1. Descoberta e detalhamento**        | Validar regras comerciais, campos obrigatórios, status, permissões e modelo visual da proposta. | Requisitos revisados e critérios de aceite.       |
| **2. UX/UI e protótipo**                | Desenhar o painel, o wizard de cadastro e a pré-visualização da proposta.                       | Protótipo navegável e identidade visual definida. |
| **3. Arquitetura e estrutura de dados** | Definir banco, API, armazenamento de documentos e estrutura dos modelos de proposta.            | Arquitetura técnica e modelo de dados.            |
| **4. Desenvolvimento do MVP**           | Implementar autenticação, painel, cadastro/edição e persistência das propostas.                 | Aplicação funcional para gerenciar propostas.     |
| **5. PDF e modelos**                    | Criar o template de três páginas, geração do PDF e pacotes reutilizáveis.                       | Exportação de PDF e templates configuráveis.      |
| **6. Testes e homologação**             | Testar fluxos, cálculos, filtros, status e fidelidade do PDF; corrigir problemas.               | Versão homologada e checklist de testes.          |
| **7. Publicação e evolução**            | Implantar, configurar monitoramento e planejar melhorias a partir do uso.                       | Sistema em produção e plano de evolução.          |

## 3. Escopo recomendado para o MVP

Para disponibilizar uma primeira versão útil, priorize:

1. Login e acesso à ferramenta.
2. Painel com listagem, busca e filtros.
3. Criação e edição de propostas pelo wizard.
4. Cadastro de cliente, evento, recursos, equipamentos, valores e condições.
5. Salvamento como rascunho e atualização do status.
6. Pré-visualização e exportação do PDF de três páginas.
7. Duplicação de propostas.

**Segunda etapa:** pacotes padrão, link compartilhável, filtros avançados e melhorias no fluxo de aprovação.

## 4. Arquitetura sugerida

A especificação recomenda:

- **Frontend:** React ou Next.js com Tailwind CSS.
- **Backend:** Node.js com NestJS/Express ou Python com FastAPI.
- **Banco de dados:** PostgreSQL ou MongoDB.
- **PDF:** Puppeteer para converter HTML/CSS em PDF ou `@react-pdf/renderer`.

A decisão deve considerar a experiência da equipe e, principalmente, a necessidade de reproduzir com fidelidade o layout final da proposta.

## 5. Critérios de aceite essenciais

- Uma proposta pode ser criada, salva, editada e localizada no painel.
- Os campos e valores preenchidos aparecem corretamente na pré-visualização.
- O PDF contém as três páginas previstas e mantém o padrão visual aprovado.
- O parcelamento apresenta datas e valores corretos.
- Os modelos reutilizáveis preenchem os serviços e equipamentos definidos.
- O usuário consegue atualizar o status da proposta e consultar propostas por filtros.

## 6. Decisões a validar antes do desenvolvimento

- Quais campos serão obrigatórios em cada etapa?
- Como os status serão alterados: manualmente ou por regras automáticas?
- O link da proposta será público, protegido por senha ou disponível apenas para usuários internos?
- O cliente poderá aceitar a proposta pela plataforma ou o aceite será apenas registrado no documento?
- Quem poderá criar, editar, excluir e aprovar propostas?
- Qual será o layout final, incluindo logotipo, cores, fontes e textos contratuais?

Essas decisões devem ser fechadas na etapa de descoberta, pois afetam o protótipo, o modelo de dados e o desenvolvimento do fluxo de propostas.
