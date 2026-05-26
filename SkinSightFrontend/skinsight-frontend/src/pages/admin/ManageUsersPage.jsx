import { useEffect, useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../api/axios';

export default function ManageUsersPage() {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [activeTab, setActiveTab] = useState('patients');
  const [showCreateDoctor, setShowCreateDoctor] = useState(false);
  const [creatingDoctor, setCreatingDoctor] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    licenseNumber: '',
    phone: '',
    specialization: 'Dermatology',
    yearsOfExperience: '',
    hospitalAffiliation: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [patientsRes, doctorsRes] = await Promise.all([
        api.get('/api/users/patients'),
        api.get('/api/users/doctors'),
      ]);

      setPatients(patientsRes.data || []);
      setDoctors(doctorsRes.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await api.patch(`/api/users/${userId}/toggle-status`);
      toast.success('User status updated');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!formData.licenseNumber.trim()) {
      toast.error('License Number is required');
      return;
    }

    try {
      setCreatingDoctor(true);

      await api.post('/api/auth/create-doctor', {
        name: formData.name,
        email: formData.email,
        licenseNumber: formData.licenseNumber,
        phone: formData.phone || '',
        specialization: formData.specialization,
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : null,
        hospitalAffiliation: formData.hospitalAffiliation || '',
      });

      toast.success('Doctor account created. Login credentials sent by email.');
      setShowCreateDoctor(false);
      setFormData({
        name: '',
        email: '',
        licenseNumber: '',
        phone: '',
        specialization: 'Dermatology',
        yearsOfExperience: '',
        hospitalAffiliation: '',
      });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create doctor');
      console.error(error);
    } finally {
      setCreatingDoctor(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // Patient table columns
  const patientColumns = [
    {
      key: 'name',
      label: 'Name',
      width: '25%',
    },
    {
      key: 'email',
      label: 'Email',
      width: '30%',
      render: (value) => (
        <a href={`mailto:${value}`} className="text-sky-600 hover:underline text-sm">
          {value}
        </a>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined Date',
      width: '20%',
      render: (value) =>
        new Date(value).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    },
    {
      key: 'active',
      label: 'Status',
      width: '15%',
      render: (value) => {
        const isActive = value === true || value === 'true';
        return (
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              isActive
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      key: 'id',
      label: 'Action',
      width: '10%',
      render: (value, row) => (
        <button
          onClick={() => handleToggleStatus(value, row.active)}
          className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 transition-all"
        >
          {row.active ? 'Deactivate' : 'Activate'}
        </button>
      ),
    },
  ];

  // Doctor table columns
  const doctorColumns = [
    {
      key: 'name',
      label: 'Name',
      width: '18%',
    },
    {
      key: 'email',
      label: 'Email',
      width: '20%',
      render: (value) => (
        <a href={`mailto:${value}`} className="text-sky-600 hover:underline text-sm">
          {value}
        </a>
      ),
    },
    {
      key: 'specialization',
      label: 'Specialization',
      width: '18%',
      render: (value) => value || <span className="text-slate-400">-</span>,
    },
    {
      key: 'licenseNumber',
      label: 'License #',
      width: '16%',
      render: (value) => value || <span className="text-slate-400">-</span>,
    },
    {
      key: 'active',
      label: 'Status',
      width: '14%',
      render: (value) => {
        const isActive = value === true || value === 'true';
        return (
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              isActive
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      key: 'id',
      label: 'Action',
      width: '14%',
      render: (value, row) => (
        <button
          onClick={() => handleToggleStatus(value, row.active)}
          className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 transition-all"
        >
          {row.active ? 'Deactivate' : 'Activate'}
        </button>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header with Tabs and Create Button */}
        <div className="flex items-center justify-between">
          <div className="flex gap-4 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('patients')}
              className={`px-4 py-3 font-semibold text-sm transition-all border-b-2 ${
                activeTab === 'patients'
                  ? 'text-sky-600 border-sky-500'
                  : 'text-slate-600 border-transparent hover:text-slate-800'
              }`}
            >
              Patients ({patients.length})
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-4 py-3 font-semibold text-sm transition-all border-b-2 ${
                activeTab === 'doctors'
                  ? 'text-sky-600 border-sky-500'
                  : 'text-slate-600 border-transparent hover:text-slate-800'
              }`}
            >
              Doctors ({doctors.length})
            </button>
          </div>

          {activeTab === 'doctors' && (
            <button
              onClick={() => setShowCreateDoctor(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 text-white rounded-lg font-semibold hover:-translate-y-0.5 transition-all shadow flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Create Doctor
            </button>
          )}
        </div>

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <DataTable
              columns={patientColumns}
              data={patients}
              searchableFields={['name', 'email']}
              paginated={true}
              pageSize={10}
            />
          </div>
        )}

        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <DataTable
              columns={doctorColumns}
              data={doctors}
              searchableFields={['name', 'email', 'specialization']}
              paginated={true}
              pageSize={10}
            />
          </div>
        )}
      </div>

      {/* Create Doctor Modal */}
      <Modal
        isOpen={showCreateDoctor}
        onClose={() => {
          setShowCreateDoctor(false);
          setFormData({
            name: '',
            email: '',
          });
        }}
        title="Create Doctor Account"
      >
        <form onSubmit={handleCreateDoctor} className="space-y-4">
          {/* Specialization Note */}
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg">
            <p className="text-sm text-sky-800">
              <span className="font-semibold">Note:</span> SkinSight is specialized in dermatological screening. All doctors will be registered with Dermatology specialization.
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Dr. Jane Smith"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none transition-all text-sm"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="jane@hospital.com"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none transition-all text-sm"
            />
          </div>

          {/* License Number */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              License Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleInputChange}
              placeholder="DM123456"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none transition-all text-sm"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+1-555-0123"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none transition-all text-sm"
            />
          </div>

          {/* Specialization */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Specialization <span className="text-rose-500">*</span>
            </label>
            <select
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none transition-all text-sm"
            >
              <option value="Dermatology">Dermatology</option>
            </select>
          </div>

          {/* Years of Experience */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Years of Experience
            </label>
            <input
              type="number"
              name="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={handleInputChange}
              placeholder="10"
              min="0"
              max="70"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none transition-all text-sm"
            />
          </div>

          {/* Hospital Affiliation */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Hospital Affiliation
            </label>
            <input
              type="text"
              name="hospitalAffiliation"
              value={formData.hospitalAffiliation}
              onChange={handleInputChange}
              placeholder="City Medical Center"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none transition-all text-sm"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setShowCreateDoctor(false);
                setFormData({
                  name: '',
                  email: '',
                  licenseNumber: '',
                  phone: '',
                  specialization: 'Dermatology',
                  yearsOfExperience: '',
                  hospitalAffiliation: '',
                });
              }}
              disabled={creatingDoctor}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingDoctor}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 text-white rounded-lg font-semibold hover:-translate-y-0.5 transition-all shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {creatingDoctor ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <PlusIcon className="w-5 h-5" />
                  Create Doctor
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}