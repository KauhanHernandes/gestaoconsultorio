export interface Patient {
  id: string;
  name: string;
  age: number;
  weekday: number;
  session_value: number;
  phone: string;
  notes: string;
  active: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  month: number;
  year: number;
  paid: boolean;
  value: number;
  notes: string;
  created_at: string;
}

export interface PatientWithAppointments extends Patient {
  appointments?: Appointment[];
}

export interface MonthlyReport {
  patient: Patient;
  appointments: Appointment[];
  totalSessions: number;
  totalValue: number;
  paidSessions: number;
  unpaidSessions: number;
}

export const WEEKDAYS = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado'
];

export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
