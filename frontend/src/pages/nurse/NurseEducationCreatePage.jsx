import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Play, Image as ImageIcon, Check, Upload } from 'lucide-react';
import { MainLayout, NurseSidebar } from '../../components/common/Layout';
import { LoadingSpinner } from '../../components/common';
import { educationService } from '../../services/api';
import toast from 'react-hot-toast';

const CONTENT_TYPES = [
  { id: 'article', label: 'Article', icon: FileText, description: 'Text-based educational content' },
  { id: 'video', label: 'Video', icon: Play, description: 'Video content with optional transcript' },
  { id: 'infographic', label: 'Infographic', icon: ImageIcon, description: 'Visual charts and diagrams' },
];

const CATEGORIES = ['basics', 'diet', 'medications', 'lifestyle', 'complications'];

const NurseEducationCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [contentType, setContentType] = useState('article');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'basics',
    body: '',
    videoUrl: '',
    imageUrl: '',
    readTime: '5 min',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error('File size must be less than 20MB');
        return;
      }
      // In real app, upload to storage and get URL
      const url = URL.createObjectURL(file);
      handleChange(field, url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    setLoading(true);
    try {
      await educationService.create(formData);
      toast.success('Content created successfully');
      navigate('/nurse/education');
    } catch (error) {
      toast.error('Failed to create content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout sidebar={NurseSidebar}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/nurse/education"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-montserrat font-bold text-kidney-charcoal">
              Create Education Content
            </h1>
            <p className="text-gray-600 mt-1">
              Create articles, videos, or infographics for patients
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content Type Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
              Content Type
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CONTENT_TYPES.map(({ id, label, icon: Icon, description }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setContentType(id)}
                  className={`flex flex-col items-start gap-2 p-4 rounded-lg border-2 transition-colors ${
                    contentType === id
                      ? 'border-kidney-green bg-kidney-cream'
                      : 'border-gray-200 hover:border-kidney-green'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    contentType === id ? 'bg-kidney-green text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="font-medium text-kidney-charcoal">{label}</p>
                  <p className="text-xs text-gray-500">{description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
              General Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="input-field"
                  placeholder="Enter a descriptive title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="input-field h-24 resize-none"
                  placeholder="Brief description of the content"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="input-field"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Read Time
                  </label>
                  <input
                    type="text"
                    value={formData.readTime}
                    onChange={(e) => handleChange('readTime', e.target.value)}
                    className="input-field"
                    placeholder="e.g., 5 min read"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
              Content
            </h2>
            
            {contentType === 'article' && (
              <textarea
                value={formData.body}
                onChange={(e) => handleChange('body', e.target.value)}
                className="input-field h-64 resize-none"
                placeholder="Write your article content here... (HTML supported)"
              />
            )}
            
            {contentType === 'video' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      id="video-upload"
                      onChange={(e) => handleFileUpload(e, 'videoUrl')}
                      accept="video/*"
                      className="hidden"
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      {formData.videoUrl ? (
                        <p className="text-kidney-green">Video uploaded</p>
                      ) : (
                        <div>
                          <p className="font-medium text-kidney-charcoal">
                            Click to upload video
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            MP4, MOV up to 100MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video Transcript (Optional)
                  </label>
                  <textarea
                    value={formData.body}
                    onChange={(e) => handleChange('body', e.target.value)}
                    className="input-field h-32 resize-none"
                    placeholder="Add a transcript for accessibility"
                  />
                </div>
              </div>
            )}
            
            {contentType === 'infographic' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="image-upload"
                    onChange={(e) => handleFileUpload(e, 'imageUrl')}
                    accept="image/*"
                    className="hidden"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    {formData.imageUrl ? (
                      <div>
                        <p className="text-kidney-green">Image uploaded</p>
                        <img src={formData.imageUrl} alt="Preview" className="max-h-48 mx-auto mt-4 rounded-lg" />
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-kidney-charcoal">
                          Click to upload image
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          JPG, PNG, SVG up to 10MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-montserrat font-semibold text-kidney-charcoal mb-4">
              Tags
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-kidney-cream text-kidney-green rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-kidney-red"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="input-field"
                placeholder="Add a tag and press Enter"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="btn-outline"
              >
                Add
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/nurse/education')}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : <Check className="w-5 h-5" />}
              Create Content
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default NurseEducationCreatePage;
