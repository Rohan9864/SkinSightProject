import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DocumentArrowUpIcon,
  CheckCircleIcon,
  LightBulbIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

export default function SubmitCasePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    bodyArea: '',
    description: '',
    duration: '',
  });

  const handleImageSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only JPG and PNG images are allowed');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-sky-400', 'bg-sky-50');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('border-sky-400', 'bg-sky-50');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-sky-400', 'bg-sky-50');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageSelect(files[0]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'description' && value.length > 500) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!image) {
      toast.error('Please upload an image');
      return;
    }
    if (!formData.bodyArea.trim()) {
      toast.error('Please specify the body area');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please provide a description');
      return;
    }
    if (!formData.duration.trim()) {
      toast.error('Please specify the duration');
      return;
    }

    try {
      setLoading(true);

      // Create FormData for multipart upload
      const uploadData = new FormData();
      uploadData.append('image', image);
      uploadData.append('bodyArea', formData.bodyArea);
      uploadData.append('description', formData.description);
      uploadData.append('duration', formData.duration);

      const response = await api.post('/api/cases', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Case submitted successfully! Your case is being analyzed by AI.');
      
      // Wait a moment then navigate
      setTimeout(() => {
        navigate('/patient');
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit case');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/patient');
  };

  return (
    <DashboardLayout title="Submit New Case">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: FORM (70%) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-8">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('imageInput').click()}
                className="text-center cursor-pointer transition-all rounded-xl p-8 hover:bg-slate-50"
              >
                {preview ? (
                  <div className="space-y-4">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {image.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {(image.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImage(null);
                        setPreview(null);
                      }}
                      className="text-sm text-sky-600 hover:text-sky-700 font-semibold"
                    >
                      Change Image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <DocumentArrowUpIcon className="w-12 h-12 text-slate-400 mx-auto" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Drag and drop your image here
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        or click to browse (JPG/PNG, max 10MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <input
                id="imageInput"
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => handleImageSelect(e.target.files?.[0])}
                className="hidden"
              />
            </div>

            {/* Body Area */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Body Area <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="bodyArea"
                value={formData.bodyArea}
                onChange={handleInputChange}
                placeholder="e.g. Left arm, Back, Face"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none transition-all text-sm"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the lesion — color, texture, changes..."
                rows={5}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none transition-all text-sm resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-slate-500">
                  {formData.description.length} / 500
                </p>
                {formData.description.length === 500 && (
                  <p className="text-xs text-amber-600">Maximum characters reached</p>
                )}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Duration <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="e.g. 2 weeks, 3 months"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none transition-all text-sm"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 text-white rounded-lg font-semibold hover:-translate-y-0.5 transition-all shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <DocumentArrowUpIcon className="w-5 h-5" />
                    Submit Case
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: INFO PANEL (30%) */}
        <div className="space-y-6">
          {/* Steps */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">
              What Happens Next
            </h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-sky-600">1</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Submit Case</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Your image and details are uploaded securely
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-sky-600">2</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">AI Analysis</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Advanced ML model analyzes your image
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-sky-600">3</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Doctor Review</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Licensed dermatologist reviews results
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-sky-600">4</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Get Results</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Receive diagnosis and clinical recommendations
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-3">
            <div className="flex gap-3">
              <LightBulbIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 text-sm mb-2">
                  Tips for a Good Photo
                </p>
                <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                  <li>Use natural lighting or bright artificial light</li>
                  <li>Avoid shadows and glare</li>
                  <li>Get close enough to see details clearly</li>
                  <li>Take photo straight-on when possible</li>
                  <li>Include context (show surrounding skin)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
            <div className="flex gap-3">
              <ShieldCheckIcon className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800 text-sm mb-1">
                  Your Privacy Matters
                </p>
                <p className="text-xs text-slate-600">
                  Your images are stored securely, encrypted, and only visible to
                  assigned healthcare professionals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}