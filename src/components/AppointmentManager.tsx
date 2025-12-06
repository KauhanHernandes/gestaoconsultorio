import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Check, X, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Patient, Appointment, WEEKDAYS, MONTHS } from '../types';
import ConfirmModal from './ConfirmModal';

interface AppointmentManagerProps {
  patient: Patient;
  onClose: () => void;
}

export default function AppointmentManager({ patient, onClose }: AppointmentManagerProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadAppointments();
  }, [selectedMonth, selectedYear]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patient.id)
        .eq('month', selectedMonth)
        .eq('year', selectedYear)
        .order('appointment_date');

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const countWeekdaysInMonth = (year: number, month: number, weekday: number): number => {
    let count = 0;
    const date = new Date(year, month - 1, 1);

    while (date.getMonth() === month - 1) {
      if (date.getDay() === weekday) {
        count++;
      }
      date.setDate(date.getDate() + 1);
    }

    return count;
  };

  const generateAppointments = async () => {
    try {
      const occurrences = countWeekdaysInMonth(selectedYear, selectedMonth, patient.weekday);
      const date = new Date(selectedYear, selectedMonth - 1, 1);
      const appointmentsToCreate = [];

      let foundCount = 0;
      while (date.getMonth() === selectedMonth - 1 && foundCount < occurrences) {
        if (date.getDay() === patient.weekday) {
          appointmentsToCreate.push({
            patient_id: patient.id,
            appointment_date: date.toISOString().split('T')[0],
            month: selectedMonth,
            year: selectedYear,
            paid: false,
            value: patient.session_value,
            notes: ''
          });
          foundCount++;
        }
        date.setDate(date.getDate() + 1);
      }

      const { error } = await supabase
        .from('appointments')
        .insert(appointmentsToCreate);

      if (error) throw error;
      loadAppointments();
    } catch (error) {
      console.error('Error generating appointments:', error);
    }
  };

  const togglePaid = async (appointment: Appointment) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ paid: !appointment.paid })
        .eq('id', appointment.id);

      if (error) throw error;
      loadAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const expectedAppointments = countWeekdaysInMonth(selectedYear, selectedMonth, patient.weekday);
  const totalValue = appointments.reduce((sum, apt) => sum + Number(apt.value), 0);
  const paidCount = appointments.filter(apt => apt.paid).length;
  const unpaidCount = appointments.length - paidCount;

  return (
    <div>
      <div className="flex items-start space-x-3 mb-6 sm:mb-8">
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-green-500 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-3xl font-bold text-green-500 truncate">Consultas - {patient.name}</h1>
          <p className="text-sm sm:text-base text-gray-400">
            {WEEKDAYS[patient.weekday]} | R$ {patient.session_value.toFixed(2)} por consulta
          </p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-green-800 rounded-lg p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Mês</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-2 bg-zinc-800 border border-green-800 rounded-lg text-white focus:outline-none focus:border-green-600"
              >
                {MONTHS.map((month, index) => (
                  <option key={index} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Ano</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 bg-zinc-800 border border-green-800 rounded-lg text-white focus:outline-none focus:border-green-600"
              >
                {[2024, 2025, 2026].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={generateAppointments}
            disabled={appointments.length > 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              appointments.length > 0
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-green-700 hover:bg-green-600 text-white'
            }`}
          >
            <Plus className="w-5 h-5" />
            <span>Gerar Consultas do Mês</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-green-800">
          <div>
            <p className="text-sm text-gray-400">Esperado no Mês</p>
            <p className="text-2xl font-bold text-white">{expectedAppointments}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Total de Consultas</p>
            <p className="text-2xl font-bold text-white">{appointments.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Pagas / Pendentes</p>
            <p className="text-2xl font-bold text-white">
              {paidCount} / <span className="text-yellow-500">{unpaidCount}</span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Valor Total</p>
            <p className="text-2xl font-bold text-green-500">R$ {totalValue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-green-500">Carregando...</div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-zinc-900 border border-green-800 rounded-lg">
          Nenhuma consulta registrada para este mês. Clique em "Gerar Consultas do Mês" para criar automaticamente.
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => {
            const date = new Date(appointment.appointment_date + 'T00:00:00');
            return (
              <div
                key={appointment.id}
                className={`bg-zinc-900 border rounded-lg p-4 flex items-center justify-between hover:border-green-600 transition-all ${
                  appointment.paid ? 'border-green-800' : 'border-yellow-800'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => togglePaid(appointment)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      appointment.paid
                        ? 'bg-green-700 text-white'
                        : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                    }`}
                  >
                    {appointment.paid ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                  </button>

                  <div>
                    <p className="text-white font-medium">
                      {date.toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-400">
                      R$ {appointment.value.toFixed(2)} • {appointment.paid ? 'Pago' : 'Pendente'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setDeleteConfirm(appointment.id)}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) deleteAppointment(deleteConfirm);
          setDeleteConfirm(null);
        }}
        title="Excluir Consulta"
        message="Tem certeza que deseja excluir esta consulta?"
        confirmText="Excluir"
      />
    </div>
  );
}
