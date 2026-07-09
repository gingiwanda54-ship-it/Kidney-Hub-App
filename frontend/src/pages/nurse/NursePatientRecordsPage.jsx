import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Activity, TestTube, Scan, Calendar, ChevronRight, Search, User } from 'lucide-react';
import { MainLayout, NurseSidebar } from '../../components/common/Layout';
import { LoadingSpinner } from '../../components/common';
import { nurseService } from '../../services/api';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'all', label: 'All Records', icon: FileText },
  { id: 'vitals', label: 'Vitals', icon: Activity },
  { id: 'lab_results', label: 'Lab Results', icon: TestTube },
  { id: 'scans', label: 'Scans', icon: Scan },
];

const NursePatientRecordsPage = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [patientId, activeTab]);

  const fetchData = async () => {
    try {
      const [patientRes, recordsRes] = await Promise.all([
        nurseService.getPatientById(patientId),
        nurseService.getPatientRecords(patientId),
      ]);
      setPatient(patientRes.data);
      setRecords(recordsRes.data);
    } catch (error) {
      toast.error('Failed to load patient records');
    } finally {
      setLoading(false);
    }
  };

  const getRecordTypeColor = (type) => {
    switch (type) {
      case 'vitals':
        return 'bg-blue-100 text-blue-800';
      case 'lab_results':
        return 'bg-purple-100 text-purple-800';
      case 'scans':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesTab = activeTab === 'all' || record.type === activeTab;
    const matchesSearch = record.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <MainLayout sidebar={NurseSidebar}>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout sidebar={NurseSidebar}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/nurse/patients"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-montserrat font-bold text-kidney-charcoal">
              {patient?.user?.first_name} {patient?.user?.last_name}'s Health Records
            </h1>
            <p className="text-gray-600 mt-1">
              View and manage patient's health history
            </p>
          </div>
        </div>

        {/* Patient Info Card */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-kidney-cream rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-kidney-green" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-kidney-charcoal">
                {patient?.user?.first_name} {patient?.user?.last_name}
              </p>
              <p className="text-sm text-gray-500">
                {patient?.user?.email}
              </p>
            </div>
            <Link
              to={`/nurse/patients/${patientId}/records/upload`}
              className="btn-primary flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Add Record
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === id
                    ? 'border-kidney-green text-kidney-green'
                    : 'border-transparent text-gray-500 hover:text-kidney-green'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kidney-green focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Records List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredRecords.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <Link
                  key={record.id}
                  to={`/nurse/patients/${patientId}/records/${record.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-kidney-cream rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-kidney-green" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-kidney-charcoal truncate">
                        {record.title}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRecordTypeColor(record.type)}`}>
                        {record.type?.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {record.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(record.date).toLocaleDateString()}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No records found</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default NursePatientRecordsPage;
