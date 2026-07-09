import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}, ref) => {
  const variantClasses = {
    primary: 'bg-kidney-green hover:bg-kidney-teal text-white',
    secondary: 'bg-kidney-teal hover:bg-kidney-teal-light text-white',
    outline: 'border-2 border-kidney-green text-kidney-green hover:bg-kidney-green hover:text-white',
    ghost: 'text-kidney-green hover:bg-kidney-cream',
    danger: 'bg-kidney-red hover:bg-red-700 text-white',
  };

  const sizeClasses = {
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-3 px-6',
    lg: 'py-4 px-8 text-lg',
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-montserrat font-semibold 
        rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {Icon && !loading && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
