import { useState } from 'react';

export default function HeatmapViewer({
  originalUrl,
  heatmapUrl,
  maxWidth = '100%',
}) {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [imageZoomed, setImageZoomed] = useState(false);

  const currentUrl = showHeatmap ? heatmapUrl : originalUrl;

  // Ensure full URLs
  const fullOriginalUrl = originalUrl?.startsWith('http')
    ? originalUrl
    : `http://localhost:8080/${originalUrl}`;

  const fullHeatmapUrl = heatmapUrl?.startsWith('http')
    ? heatmapUrl
    : `http://localhost:8080/${heatmapUrl}`;

  const displayUrl = showHeatmap ? fullHeatmapUrl : fullOriginalUrl;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4">
      {/* Toggle Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowHeatmap(false)}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            !showHeatmap
              ? 'bg-sky-500 text-white'
              : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Original
        </button>
        {heatmapUrl && (
          <button
            onClick={() => setShowHeatmap(true)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              showHeatmap
                ? 'bg-sky-500 text-white'
                : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Heatmap (Grad-CAM)
          </button>
        )}
      </div>

      {/* Image Viewer */}
      <div className={`relative bg-slate-50 rounded-xl overflow-hidden ${imageZoomed ? 'fixed inset-0 z-40 rounded-none' : ''}`}>
        <img
          src={displayUrl}
          alt={showHeatmap ? 'Grad-CAM Heatmap' : 'Original Skin Image'}
          onClick={() => setImageZoomed(!imageZoomed)}
          className={`w-full h-auto object-contain transition-all cursor-zoom-in hover:opacity-95 ${
            imageZoomed ? 'max-h-screen' : `max-h-96`
          }`}
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="20" fill="%239ca3af" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
          }}
        />
        {imageZoomed && (
          <div
            className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            Click to close
          </div>
        )}
      </div>

      {/* Image Info */}
      <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
        <p>
          {showHeatmap
            ? 'Grad-CAM visualization showing regions of interest for the AI prediction'
            : 'Original uploaded skin lesion image'}
        </p>
        <p className="mt-1 text-slate-400">Click image to zoom</p>
      </div>
    </div>
  );
}
