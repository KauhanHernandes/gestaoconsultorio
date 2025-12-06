/*
  # Sistema de Gestão de Pacientes - Nutrição Infantil

  1. Novas Tabelas
    - `patients` (pacientes)
      - `id` (uuid, chave primária)
      - `name` (text) - Nome do paciente
      - `age` (integer) - Idade do paciente
      - `weekday` (integer) - Dia da semana (0=Domingo, 1=Segunda, 2=Terça, etc)
      - `session_value` (decimal) - Valor por consulta
      - `phone` (text) - Telefone de contato
      - `notes` (text) - Observações
      - `active` (boolean) - Paciente ativo
      - `created_at` (timestamptz) - Data de criação

    - `appointments` (consultas)
      - `id` (uuid, chave primária)
      - `patient_id` (uuid) - Referência ao paciente
      - `appointment_date` (date) - Data da consulta
      - `month` (integer) - Mês (1-12)
      - `year` (integer) - Ano
      - `paid` (boolean) - Status de pagamento
      - `value` (decimal) - Valor da consulta
      - `notes` (text) - Observações da consulta
      - `created_at` (timestamptz) - Data de criação

  2. Segurança
    - RLS desabilitado conforme solicitado (sem autenticação)
    - Acesso público total às tabelas

  3. Índices
    - Índice em `patient_id` para buscas rápidas
    - Índice em `month` e `year` para relatórios
*/

-- Tabela de Pacientes
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age integer NOT NULL,
  weekday integer NOT NULL CHECK (weekday >= 0 AND weekday <= 6),
  session_value decimal(10,2) NOT NULL,
  phone text DEFAULT '',
  notes text DEFAULT '',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tabela de Consultas
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_date date NOT NULL,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL,
  paid boolean DEFAULT false,
  value decimal(10,2) NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_month_year ON appointments(month, year);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_patients_active ON patients(active);

-- Desabilitar RLS (acesso público conforme solicitado)
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;