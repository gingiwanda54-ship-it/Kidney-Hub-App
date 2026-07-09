import { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import Button from './Button';

const ProfilePhotoUpload = ({ currentPhoto, onUpload, loading }) => {
  const [preview, setPreview] = useState(currentPhoto);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Pass file to parent
    onUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onUpload(null);
  };

  return (
    <div className="flex flex-col items-center">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative w-32 h-32 rounded-full overflow-hidden
          ${isDragging ? 'ring-4 ring-kidney-green ring-offset-2' : ''}
        `}
      >
        {preview ? (
          <img
            src={preview}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-kidney-cream flex items-center justify-center">
            <Camera className="w-8 h-8 text-kidney-green" />
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
          <label className="cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
              disabled={loading}
            />
            <div className="bg-white rounded-full p-2 shadow-lg">
              <Camera className="w-5 h-5 text-kidney-green" />
            </div>
          </label>
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-500 text-center">
        Click to upload photo<br />
        <span className="text-xs">JPEG, PNG, WebP (max 5MB)</span>
      </p>

      {preview && (
        <div className="flex gap-2 mt-3">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
              disabled={loading}
            />
            <Button variant="outline" size="sm" loading={loading}>
              Change Photo
            </Button>
          </label>
          <Button variant="ghost" size="sm" onClick={handleRemove}>
            Remove
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoUpload;
