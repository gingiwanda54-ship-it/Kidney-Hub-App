import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { MainLayout, PatientSidebar } from '../../components/common/Layout';
import { NurseCard, FilterSidebar } from '../../components/booking';
import { InputField, LoadingSpinner, NurseCardSkeleton } from '../../components/common';
import { nurseService } from '../../services/api';
import toast from 'react-hot-toast';

const PatientBookPage = () => {
  const navigate = useNavigate();
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    languages: [],
    experience: '',
    consultationType: '',
    specialization: '',
    minRating: 0,
  });

  useEffect(() => {
    fetchNurses();
  }, [filters]);

  const fetchNurses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.languages?.length > 0) {
        params.languages = filters.languages.join(',');
      }
      if (filters.experience) {
        params.experience = filters.experience;
      }
      if (filters.consultationType) {
        params.consultationType = filters.consultationType;
      }
      if (filters.specialization) {
        params.specialization = filters.specialization;
      }
      if (filters.minRating) {
        params.minRating = filters.minRating;
      }

      const response = await nurseService.getAll(params);
      setNurses(response.data);
    } catch (error) {
      toast.error('Failed to load nurses');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      languages: [],
      experience: '',
      consultationType: '',
      specialization: '',
      minRating: 0,
    });
  };

  const filteredNurses = nurses.filter((nurse) => {
    if (!searchQuery) return true;
    const fullName = `${nurse.user?.first_name} ${nurse.user?.last_name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  return (
    <MainLayout sidebar={PatientSidebar}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-montserrat font-bold text-kidney-charcoal">
            Find a Nurse
          </h1>
          <p className="text-gray-600 mt-1">
            Browse and filter verified kidney care nurses
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <InputField
                placeholder="Search by name or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            onClear={handleClearFilters}
          />

          {/* Nurse List */}
          <div className="flex-1">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <NurseCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredNurses.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-4">
                  {filteredNurses.length} nurse{filteredNurses.length !== 1 ? 's' : ''} found
                </p>
                {filteredNurses.map((nurse) => (
                  <NurseCard
                    key={nurse.id}
                    nurse={nurse}
                    onClick={() => navigate(`/patient/book/${nurse.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-kidney-charcoal mb-2">
                  No nurses found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your filters or search query
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PatientBookPage;
