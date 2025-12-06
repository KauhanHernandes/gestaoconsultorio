# Sistema de Gestão de Nutrição Infantil

Sistema completo de gestão para nutricionistas infantis com controle de pacientes, consultas e geração de relatórios profissionais em PDF.

## Funcionalidades Principais

### Dashboard
- Visão geral com estatísticas importantes
- Total de pacientes ativos
- Consultas do mês atual
- Receita mensal (total e pendente)

### Pacientes e Consultas
- Cadastro completo de pacientes com informações personalizadas
- Cada paciente possui:
  - Nome, idade e telefone
  - Dia da semana das consultas
  - Valor individual por consulta
  - Status ativo/inativo
- Geração automática de consultas mensais baseada no dia da semana
- Sistema inteligente que calcula automaticamente quantas vezes o dia da semana aparece no mês
- Controle de pagamento individual por consulta
- Edição e exclusão de pacientes e consultas

### Relatórios e PDF
- Relatórios mensais detalhados
- Geração de PDF profissional com:
  - Relatório completo de todos os pacientes
  - Relatórios individuais por paciente
  - Resumo financeiro
  - Lista de consultas pagas e pendentes
- Design profissional em verde militar

## Como Usar

### 1. Cadastrar Pacientes
- Acesse a aba "Pacientes e Consultas"
- Clique em "Novo Paciente"
- Preencha os dados do paciente
- Selecione o dia da semana das consultas
- Defina o valor da consulta

### 2. Gerar Consultas do Mês
- Na lista de pacientes, clique em "Consultas"
- Selecione o mês e ano
- Clique em "Gerar Consultas do Mês"
- O sistema criará automaticamente todas as consultas do mês baseado no dia da semana

### 3. Controlar Pagamentos
- Marque consultas como pagas/pendentes clicando no ícone de check
- Acompanhe o status de cada consulta

### 4. Gerar Relatórios
- Acesse a aba "Relatórios"
- Selecione o mês e ano
- Visualize o resumo de todos os pacientes
- Gere PDF completo ou individual por paciente

## Lógica de Frequência

O sistema calcula automaticamente quantas vezes o dia da semana escolhido aparece no mês selecionado.

**Exemplo:**
- Paciente atende às terças-feiras
- Mês com 4 terças: 4 consultas geradas
- Mês com 5 terças: 5 consultas geradas
- Valor total = número de consultas × valor por consulta

## Design

- **Cores:** Verde Militar (#2e7d32, #46965a) com fundo preto
- **Totalmente responsivo** para desktop, tablet e mobile
- **Modais de confirmação** para todas as ações críticas
- **Interface intuitiva** e profissional

## Tecnologias

- React + TypeScript
- Tailwind CSS
- Supabase (Database)
- jsPDF (Geração de PDF)
- Lucide React (Ícones)
