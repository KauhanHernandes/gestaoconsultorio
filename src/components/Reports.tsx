import { useEffect, useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Patient, Appointment, MonthlyReport, WEEKDAYS, MONTHS } from '../types';
import { generatePDF } from '../utils/pdfGenerator';

export default function Reports() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterActive, setFilterActive] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear, filterActive]);

  const loadData = async () => {
    setLoading(true);
    try {
      let patientsQuery = supabase
        .from('patients')
        .select('*')
        .order('name');

      if (filterActive) {
        patientsQuery = patientsQuery.eq('active', true);
      }

      const { data: patientsData, error: patientsError } = await patientsQuery;

      if (patientsError) throw patientsError;

      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('month', selectedMonth)
        .eq('year', selectedYear);

      if (appointmentsError) throw appointmentsError;

      const allPatients = patientsData || [];
      const appointments = appointmentsData || [];

      const reportsData: MonthlyReport[] = allPatients
        .map(patient => {
          const patientAppointments = appointments.filter(
            apt => apt.patient_id === patient.id
          );

          return {
            patient,
            appointments: patientAppointments,
            totalSessions: patientAppointments.length,
            totalValue: patientAppointments.reduce((sum, apt) => sum + Number(apt.value), 0),
            paidSessions: patientAppointments.filter(apt => apt.paid).length,
            unpaidSessions: patientAppointments.filter(apt => !apt.paid).length
          };
        })
        .sort((a, b) => a.patient.name.localeCompare(b.patient.name));

      setPatients(allPatients);
      setReports(reportsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = (report?: MonthlyReport) => {
    const reportsToGenerate = report ? [report] : reports;
    generatePDF(reportsToGenerate, selectedMonth, selectedYear);
  };

  const totalRevenue = reports.reduce((sum, report) => sum + report.totalValue, 0);
  const totalSessions = reports.reduce((sum, report) => sum + report.totalSessions, 0);
  const totalPaid = reports.reduce((sum, report) => sum + report.paidSessions, 0);
  const totalUnpaid = reports.reduce((sum, report) => sum + report.unpaidSessions, 0);
  const paidRevenue = reports.reduce((sum, report) => {
    return sum + report.appointments
      .filter(apt => apt.paid)
      .reduce((s, apt) => s + Number(apt.value), 0);
  }, 0);
  const unpaidRevenue = totalRevenue - paidRevenue;

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-green-500 mb-6 sm:mb-8">Relatórios</h1>

      <div className="bg-zinc-900 border border-green-800 rounded-lg p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-green-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1">Mês</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-2 sm:px-3 py-2 bg-zinc-800 border border-green-800 rounded-lg text-white text-sm focus:outline-none focus:border-green-600"
              >
                {MONTHS.map((month, index) => (
                  <option key={index} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-1">Ano</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-2 sm:px-3 py-2 bg-zinc-800 border border-green-800 rounded-lg text-white text-sm focus:outline-none focus:border-green-600"
              >
                {[2024, 2025, 2026].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center space-x-2 cursor-pointer pt-2 sm:pt-5">
              <input
                type="checkbox"
                checked={filterActive}
                onChange={(e) => setFilterActive(e.target.checked)}
                className="w-4 h-4 text-green-600 bg-zinc-800 border-green-800 rounded focus:ring-green-500"
              />
              <span className="text-xs sm:text-sm text-gray-400">Apenas ativos</span>
            </label>
          </div>

          <button
            onClick={() => handleGeneratePDF()}
            disabled={reports.length === 0}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center text-sm sm:text-base ${
              reports.length === 0
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-green-700 hover:bg-green-600 text-white'
            }`}
          >
            <Download className="w-5 h-5" />
            <span>Gerar PDF</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 pt-4">
          <div className="bg-zinc-800 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">Total de Consultas</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{totalSessions}</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">Pagas / Pendentes</p>
            <p className="text-xl sm:text-2xl font-bold text-white">
              <span className="text-green-500">{totalPaid}</span> / <span className="text-yellow-500">{totalUnpaid}</span>
            </p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">Receita Total</p>
            <p className="text-xl sm:text-2xl font-bold text-green-500">R$ {totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">Receita Recebida</p>
            <p className="text-xl sm:text-2xl font-bold text-green-500">R$ {paidRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">Receita Pendente</p>
            <p className="text-xl sm:text-2xl font-bold text-yellow-500">R$ {unpaidRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">Pacientes</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{patients.length}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-green-500">Carregando...</div>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-zinc-900 border border-green-800 rounded-lg">
          Nenhum dado disponível para este período.
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {reports.map((report) => (
            <div
              key={report.patient.id}
              className="bg-zinc-900 border border-green-800 rounded-lg p-4 sm:p-6 hover:border-green-600 transition-all"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 pb-4 border-b border-green-800">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-white truncate">{report.patient.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-400">
                    {WEEKDAYS[report.patient.weekday]} • R$ {report.patient.session_value.toFixed(2)}/consulta
                    {!report.patient.active && <span className="ml-2 text-yellow-500">(Inativo)</span>}
                  </p>
                </div>
                <button
                  onClick={() => handleGeneratePDF(report)}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-900/30 hover:bg-green-900/50 text-green-500 rounded-lg transition-colors w-full sm:w-auto justify-center"
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">PDF</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
                <div className="bg-zinc-800 rounded-lg p-2 sm:p-3">
                  <p className="text-xs text-gray-400 mb-1">Total</p>
                  <p className="text-lg sm:text-xl font-bold text-white">{report.totalSessions}</p>
                </div>
                <div className="bg-green-900/20 border border-green-800 rounded-lg p-2 sm:p-3">
                  <p className="text-xs text-gray-400 mb-1">Pagas</p>
                  <p className="text-lg sm:text-xl font-bold text-green-500">{report.paidSessions}</p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-2 sm:p-3">
                  <p className="text-xs text-gray-400 mb-1">Pendentes</p>
                  <p className="text-lg sm:text-xl font-bold text-yellow-500">{report.unpaidSessions}</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-2 sm:p-3">
                  <p className="text-xs text-gray-400 mb-1">Valor</p>
                  <p className="text-lg sm:text-xl font-bold text-green-500">R$ {report.totalValue.toFixed(2)}</p>
                </div>
              </div>

              {report.appointments.length > 0 && (
                <div className="pt-3 sm:pt-4 border-t border-green-800">
                  <p className="text-xs sm:text-sm text-gray-400 mb-2 font-semibold">Consultas do Mês:</p>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {report.appointments.map((apt) => {
                      const date = new Date(apt.appointment_date + 'T00:00:00');
                      return (
                        <span
                          key={apt.id}
                          className={`text-xs px-2 py-1 rounded font-medium ${
                            apt.paid
                              ? 'bg-green-900/30 text-green-500'
                              : 'bg-yellow-900/30 text-yellow-500'
                          }`}
                        >
                          {date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                          {apt.paid ? ' ✓' : ' ⏱'}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {report.appointments.length === 0 && (
                <div className="pt-3 sm:pt-4 border-t border-green-800">
                  <p className="text-xs sm:text-sm text-gray-500 italic">Nenhuma consulta registrada neste período</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
