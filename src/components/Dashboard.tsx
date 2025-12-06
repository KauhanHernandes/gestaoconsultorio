import { useEffect, useState } from 'react';
import { Users, Calendar, DollarSign, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Patient, Appointment } from '../types';

interface Stats {
  totalPatients: number;
  activePatients: number;
  monthAppointments: number;
  monthRevenue: number;
  unpaidAppointments: number;
  unpaidRevenue: number;
  paidRevenue: number;
  paidAppointments: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalPatients: 0,
    activePatients: 0,
    monthAppointments: 0,
    monthRevenue: 0,
    unpaidAppointments: 0,
    unpaidRevenue: 0,
    paidRevenue: 0,
    paidAppointments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const { data: patients } = await supabase
        .from('patients')
        .select('*');

      const { data: monthAppointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('month', currentMonth)
        .eq('year', currentYear);

      const totalPatients = patients?.length || 0;
      const activePatients = patients?.filter(p => p.active).length || 0;

      const appointments = monthAppointments || [];
      const monthRevenue = appointments.reduce((sum, apt) => sum + Number(apt.value), 0);
      const unpaidAppointments = appointments.filter(apt => !apt.paid).length;
      const paidAppointments = appointments.filter(apt => apt.paid).length;
      const unpaidRevenue = appointments
        .filter(apt => !apt.paid)
        .reduce((sum, apt) => sum + Number(apt.value), 0);
      const paidRevenue = appointments
        .filter(apt => apt.paid)
        .reduce((sum, apt) => sum + Number(apt.value), 0);

      setStats({
        totalPatients,
        activePatients,
        monthAppointments: appointments.length,
        monthRevenue,
        unpaidAppointments,
        unpaidRevenue,
        paidRevenue,
        paidAppointments
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Pacientes Ativos',
      value: `${stats.activePatients}/${stats.totalPatients}`,
      icon: Users,
      color: 'green'
    },
    {
      title: 'Consultas do Mês',
      value: stats.monthAppointments,
      icon: Calendar,
      color: 'green'
    },
    {
      title: 'Receita do Mês',
      value: `R$ ${stats.monthRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Pendências',
      value: `${stats.unpaidAppointments} consultas`,
      subtitle: `R$ ${stats.unpaidRevenue.toFixed(2)}`,
      icon: AlertCircle,
      color: 'yellow'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-green-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-green-500 mb-6 sm:mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-zinc-900 border border-green-800 rounded-lg p-4 sm:p-6 hover:border-green-600 transition-all hover:shadow-lg hover:shadow-green-900/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.color === 'green' ? 'bg-green-900/30' : 'bg-yellow-900/30'}`}>
                  <Icon className={`w-6 h-6 ${card.color === 'green' ? 'text-green-500' : 'text-yellow-500'}`} />
                </div>
              </div>
              <h3 className="text-gray-400 text-xs sm:text-sm mb-2">{card.title}</h3>
              <p className="text-xl sm:text-2xl font-bold text-white">{card.value}</p>
              {card.subtitle && (
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{card.subtitle}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-green-800 rounded-lg p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-green-500 mb-4 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Resumo do Mês</span>
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Total de Consultas</p>
                  <p className="text-2xl font-bold text-green-500">{stats.monthAppointments}</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Receita Total</p>
                  <p className="text-2xl font-bold text-green-500">R$ {stats.monthRevenue.toFixed(2)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Consultas Pagas</p>
                  <p className="text-2xl font-bold text-green-500">{stats.paidAppointments}</p>
                  <p className="text-xs text-gray-500 mt-1">R$ {stats.paidRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Consultas Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-500">{stats.unpaidAppointments}</p>
                  <p className="text-xs text-gray-500 mt-1">R$ {stats.unpaidRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-green-800 rounded-lg p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-green-500 mb-4 flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Gestão de Pacientes</span>
            </h2>
            <div className="space-y-3 text-gray-300 text-sm sm:text-base">
              <p>Você tem <span className="text-green-500 font-semibold">{stats.activePatients} pacientes ativos</span> cadastrados no sistema.</p>
              <p>Acesse a aba <span className="text-green-500 font-semibold">"Pacientes e Consultas"</span> para:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Cadastrar novos pacientes</li>
                <li>Gerar consultas automáticas do mês</li>
                <li>Controlar pagamentos individuais</li>
                <li>Atualizar dados de pacientes</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-900/30 to-green-900/10 border border-green-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-500 mb-4">Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Taxa de Cobrança</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{
                        width: stats.monthAppointments > 0
                          ? ((stats.paidAppointments / stats.monthAppointments) * 100) + '%'
                          : '0%'
                      }}
                    ></div>
                  </div>
                  <span className="text-green-500 font-semibold text-sm">
                    {stats.monthAppointments > 0
                      ? ((stats.paidAppointments / stats.monthAppointments) * 100).toFixed(0)
                      : '0'}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-green-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-500 mb-4">Relatórios</h3>
            <p className="text-gray-400 text-sm mb-4">
              Gere relatórios detalhados e PDFs profissionais na aba "Relatórios".
            </p>
            <div className="text-xs text-gray-500 space-y-2">
              <p>✓ Relatório mensal completo</p>
              <p>✓ Ficha individual por paciente</p>
              <p>✓ Análise financeira</p>
              <p>✓ Exportação em PDF</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
