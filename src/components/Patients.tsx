import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Patient, WEEKDAYS } from '../types';
import ConfirmModal from './ConfirmModal';
import AppointmentManager from './AppointmentManager';

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weekday: '0',
    session_value: '',
    phone: '',
    notes: '',
    active: true
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const patientData = {
        name: formData.name,
        age: parseInt(formData.age),
        weekday: parseInt(formData.weekday),
        session_value: parseFloat(formData.session_value),
        phone: formData.phone,
        notes: formData.notes,
        active: formData.active
      };

      if (editingPatient) {
        const { error } = await supabase
          .from('patients')
          .update(patientData)
          .eq('id', editingPatient.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('patients')
          .insert([patientData]);

        if (error) throw error;
      }

      resetForm();
      loadPatients();
    } catch (error) {
      console.error('Error saving patient:', error);
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      age: patient.age.toString(),
      weekday: patient.weekday.toString(),
      session_value: patient.session_value.toString(),
      phone: patient.phone,
      notes: patient.notes,
      active: patient.active
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      weekday: '0',
      session_value: '',
      phone: '',
      notes: '',
      active: true
    });
    setEditingPatient(null);
    setShowForm(false);
  };

  if (selectedPatient) {
    return (
      <AppointmentManager
        patient={selectedPatient}
        onClose={() => {
          setSelectedPatient(null);
          loadPatients();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-green-500">Pacientes</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Paciente</span>
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
          <div className="bg-zinc-900 border border-green-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-green-800 sticky top-0 bg-zinc-900">
              <h2 className="text-xl font-semibold text-green-500">
                {editingPatient ? 'Editar Paciente' : 'Novo Paciente'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-green-800 rounded-lg text-white focus:outline-none focus:border-green-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Idade *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-green-800 rounded-lg text-white focus:outline-none focus:border-green-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Dia da Semana *
                  </label>
                  <select
                    required
                    value={formData.weekday}
                    onChange={(e) => setFormData({ ...formData, weekday: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-green-800 rounded-lg text-white focus:outline-none focus:border-green-600"
                  >
                    {WEEKDAYS.map((day, index) => (
                      <option key={index} value={index}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Valor por Consulta (R$) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.session_value}
                    onChange={(e) => setFormData({ ...formData, session_value: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-green-800 rounded-lg text-white focus:outline-none focus:border-green-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-green-800 rounded-lg text-white focus:outline-none focus:border-green-600"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 text-green-600 bg-zinc-800 border-green-800 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-300">Paciente Ativo</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Observações
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-zinc-800 border border-green-800 rounded-lg text-white focus:outline-none focus:border-green-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-green-800">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  {editingPatient ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-green-500">Carregando...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className="bg-zinc-900 border border-green-800 rounded-lg p-6 hover:border-green-600 transition-all hover:shadow-lg hover:shadow-green-900/20"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{patient.name}</h3>
                  <p className="text-sm text-gray-400">{patient.age} anos</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  patient.active
                    ? 'bg-green-900/30 text-green-500'
                    : 'bg-gray-800 text-gray-400'
                }`}>
                  {patient.active ? 'Ativo' : 'Inativo'}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-300">
                  <span className="text-gray-500">Dia:</span> {WEEKDAYS[patient.weekday]}
                </p>
                <p className="text-sm text-gray-300">
                  <span className="text-gray-500">Valor:</span> R$ {patient.session_value.toFixed(2)}
                </p>
                {patient.phone && (
                  <p className="text-sm text-gray-300">
                    <span className="text-gray-500">Tel:</span> {patient.phone}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-green-800">
                <button
                  onClick={() => setSelectedPatient(patient)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-900/30 hover:bg-green-900/50 text-green-500 rounded-lg transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Consultas</span>
                </button>
                <button
                  onClick={() => handleEdit(patient)}
                  className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(patient.id)}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {patients.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-400">
          Nenhum paciente cadastrado. Clique em "Novo Paciente" para começar.
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) handleDelete(deleteConfirm);
          setDeleteConfirm(null);
        }}
        title="Excluir Paciente"
        message="Tem certeza que deseja excluir este paciente? Todas as consultas associadas também serão removidas."
        confirmText="Excluir"
      />
    </div>
  );
}
