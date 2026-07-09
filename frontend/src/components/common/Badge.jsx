const Badge = ({ children, variant = 'default', className = '' }) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    teal: 'bg-teal-100 text-teal-800',
  };

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { variant: 'warning', label: 'Pending' },
    confirmed: { variant: 'success', label: 'Confirmed' },
    completed: { variant: 'info', label: 'Completed' },
    cancelled: { variant: 'error', label: 'Cancelled' },
    no_show: { variant: 'error', label: 'No Show' },
    paid: { variant: 'success', label: 'Paid' },
    refunded: { variant: 'warning', label: 'Refunded' },
    medical_aid: { variant: 'info', label: 'Medical Aid' },
  };

  const config = statusConfig[status] || { variant: 'default', label: status };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const CredentialBadge = ({ type, verified }) => {
  if (!verified) return null;

  const config = {
    sanc: { label: 'SANC Verified', color: 'bg-green-100 text-green-800' },
    bhf: { label: 'BHF Registered', color: 'bg-blue-100 text-blue-800' },
  };

  const badge = config[type];
  if (!badge) return null;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${badge.color}`}>
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      {badge.label}
    </span>
  );
};

export default Badge;
