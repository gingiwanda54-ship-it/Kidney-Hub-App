import { Star, MapPin, Video, Users } from 'lucide-react';
import { CredentialBadge } from '../common';

const NurseCard = ({ nurse, onClick }) => {
  const {
    user,
    specialization,
    years_experience,
    languages_spoken,
    sanc_verified,
    bhf_verified,
    consultation_fee,
    consultation_types,
    location_city,
    rating,
    review_count,
  } = nurse;

  const languages = languages_spoken ? JSON.parse(languages_spoken) : [];
  const types = consultation_types ? JSON.parse(consultation_types) : [];

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
    >
      <div className="flex items-start gap-4">
        {/* Photo */}
        <div className="flex-shrink-0">
          {user?.profile_photo_url ? (
            <img
              src={user.profile_photo_url}
              alt={`${user.first_name} ${user.last_name}`}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-kidney-cream flex items-center justify-center">
              <span className="text-2xl font-semibold text-kidney-green">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-montserrat font-semibold text-kidney-charcoal">
                {user?.first_name} {user?.last_name}
              </h3>
              <p className="text-sm text-gray-600">{specialization || 'General Nursing'}</p>
            </div>
            {rating && (
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium">{rating.toFixed(1)}</span>
                <span className="text-xs text-gray-500">({review_count || 0})</span>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            <CredentialBadge type="sanc" verified={sanc_verified} />
            <CredentialBadge type="bhf" verified={bhf_verified} />
          </div>

          {/* Details */}
          <div className="mt-3 space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{years_experience || 0} years experience</span>
            </div>
            {location_city && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{location_city}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-xs text-gray-500">Languages:</span>
              <span>{languages.join(', ') || 'English'}</span>
            </div>
          </div>

          {/* Consultation Types */}
          <div className="flex flex-wrap gap-2 mt-3">
            {types.includes('virtual') && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                <Video className="w-3 h-3" />
                Virtual
              </span>
            )}
            {types.includes('in_person') && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                In-Person
              </span>
            )}
          </div>

          {/* Fee */}
          {consultation_fee && (
            <div className="mt-3 pt-3 border-t">
              <span className="text-lg font-semibold text-kidney-green">
                R{consultation_fee}
              </span>
              <span className="text-sm text-gray-500"> per consultation</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NurseCard;
