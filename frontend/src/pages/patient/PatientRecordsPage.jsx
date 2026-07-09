import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Activity, TestTube, Scan, Calendar, ChevronRight, Filter, Search } from 'lucide-react';
import { MainLayout, PatientSidebar } from '../../components/common/Layout';
import { LoadingSpinner } from '../../components/common';
import { patientService } from '../../services/api';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'all', label: 'All Records', icon: FileText },
  { id: 'vitals', label: 'Vitals', icon: Activity },
  { id: 'lab_results', label: 'Lab Results', icon: TestTube },
  { id: 'scans', label: 'Scans', icon: Scan },
];

const PatientRecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchRecords();
  }, [activeTab]);

  const fetchRecords = async () => {
    try {
      const response = await patientService.getRecords();
      setRecords(response.data);
    } catch (error) {
      toast.error('Failed to load records');
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
    const matchesSearch = record.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === '30days' && new Date(record.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === '90days' && new Date(record.date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === 'year' && new Date(record.date) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000));
    return matchesTab && matchesSearch && matchesDate;
  });

  if (loading) {
    return (
      <MainLayout sidebar={PatientSidebar}>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout sidebar={PatientSidebar}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-montserrat font-bold text-kidney-charcoal">
              Health Records
            </h1>
            <p className="text-gray-600 mt-1">
              View and manage your health history
            </p>
          </div>
          <Link
            to="/patient/records/upload"
            className="btn-primary flex items-center gap-2"
          >
            <FileText className="w-5 h-5" />
            Upload Record
          </Link>
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kidney-green focus:border-transparent outline-none"
              />
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kidney-green focus:border-transparent outline-none"
            >
              <option value="all">All Time</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>

        {/* Records Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <Link
                key={record.id}
                to={`/patient/records/${record.id}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRecordTypeColor(record.type)}`}>
                    {record.type?.replace('_', ' ')}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="font-montserrat font-semibold text-kidney-charcoal mb-2">
                  {record.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {record.description}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  {new Date(record.date).toLocaleDateString()}
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No records found</p>
              <Link
                to="/patient/records/upload"
                className="text-kidney-green hover:underline mt-4 inline-block"
              >
                Upload your first record
              </Link>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default PatientRecordsPage;
