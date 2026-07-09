import { useState } from 'react';
import { X, Filter } from 'lucide-react';
import { Button } from '../common';

const LANGUAGES = [
  'English', 'Afrikaans', 'Zulu', 'Xhosa', 'Sotho', 'Tswana', 'Sepedi', 'Ndebele', 'Swazi', 'Venda', 'Tsonga'
];

const SPECIALIZATIONS = [
  'General', 'Dialysis', 'Transplant', 'Pediatric', 'ICU', 'Emergency Care'
];

const EXPERIENCE_LEVELS = [
  { value: '0-5', label: '0-5 years' },
  { value: '5-10', label: '5-10 years' },
  { value: '10-20', label: '10-20 years' },
  { value: '20+', label: '20+ years' },
];

const CONSULTATION_TYPES = [
  { value: 'virtual', label: 'Virtual' },
  { value: 'in_person', label: 'In-Person' },
  { value: 'both', label: 'Both' },
];

const FilterSidebar = ({ filters, onFilterChange, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageToggle = (language) => {
    const current = filters.languages || [];
    const updated = current.includes(language)
      ? current.filter(l => l !== language)
      : [...current, language];
    onFilterChange({ ...filters, languages: updated });
  };

  const handleExperienceChange = (value) => {
    onFilterChange({ ...filters, experience: value });
  };

  const handleConsultationTypeChange = (value) => {
    onFilterChange({ ...filters, consultationType: value });
  };

  const handleSpecializationChange = (value) => {
    onFilterChange({ ...filters, specialization: value });
  };

  const handleMinRatingChange = (e) => {
    onFilterChange({ ...filters, minRating: parseFloat(e.target.value) || 0 });
  };

  const hasActiveFilters = () => {
    return (
      (filters.languages && filters.languages.length > 0) ||
      filters.experience ||
      filters.consultationType ||
      filters.specialization ||
      filters.minRating > 0
    );
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Languages */}
      <div>
        <h4 className="font-montserrat font-semibold text-sm text-gray-700 mb-3">Languages</h4>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              onClick={() => handleLanguageToggle(lang)}
              className={`
                px-3 py-1.5 rounded-full text-sm transition-colors
                ${(filters.languages || []).includes(lang)
                  ? 'bg-kidney-green text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Specialization */}
      <div>
        <h4 className="font-montserrat font-semibold text-sm text-gray-700 mb-3">Specialization</h4>
        <div className="space-y-2">
          {SPECIALIZATIONS.map(spec => (
            <label key={spec} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="specialization"
                checked={filters.specialization === spec}
                onChange={() => handleSpecializationChange(spec)}
                className="text-kidney-green focus:ring-kidney-green"
              />
              <span className="text-sm text-gray-700">{spec}</span>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="specialization"
              checked={!filters.specialization}
              onChange={() => handleSpecializationChange('')}
              className="text-kidney-green focus:ring-kidney-green"
            />
            <span className="text-sm text-gray-700">All Specializations</span>
          </label>
        </div>
      </div>

      {/* Experience */}
      <div>
        <h4 className="font-montserrat font-semibold text-sm text-gray-700 mb-3">Experience</h4>
        <div className="space-y-2">
          {EXPERIENCE_LEVELS.map(level => (
            <label key={level.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="experience"
                checked={filters.experience === level.value}
                onChange={() => handleExperienceChange(level.value)}
                className="text-kidney-green focus:ring-kidney-green"
              />
              <span className="text-sm text-gray-700">{level.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Consultation Type */}
      <div>
        <h4 className="font-montserrat font-semibold text-sm text-gray-700 mb-3">Consultation Type</h4>
        <div className="space-y-2">
          {CONSULTATION_TYPES.map(type => (
            <label key={type.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="consultationType"
                checked={filters.consultationType === type.value}
                onChange={() => handleConsultationTypeChange(type.value)}
                className="text-kidney-green focus:ring-kidney-green"
              />
              <span className="text-sm text-gray-700">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="font-montserrat font-semibold text-sm text-gray-700 mb-3">Minimum Rating</h4>
        <input
          type="range"
          min="0"
          max="5"
          step="0.5"
          value={filters.minRating || 0}
          onChange={handleMinRatingChange}
          className="w-full accent-kidney-green"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Any</span>
          <span>{filters.minRating || 0}+ stars</span>
          <span>5 stars</span>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters() && (
        <Button variant="ghost" onClick={onClear} className="w-full">
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-40 bg-kidney-green text-white p-4 rounded-full shadow-lg"
      >
        <Filter className="w-6 h-6" />
      </button>

      {/* Mobile Filter Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-montserrat font-semibold">Filters</h3>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 flex-shrink-0">
        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
          <h3 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-6">Filters</h3>
          <FilterContent />
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
