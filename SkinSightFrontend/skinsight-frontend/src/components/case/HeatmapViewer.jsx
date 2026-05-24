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

      {/* Image Viewer Container */}
      {imageZoomed && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setImageZoomed(false)}
        >
          <div
            className="relative bg-slate-900 rounded-xl overflow-hidden max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={displayUrl}
              alt={showHeatmap ? 'Grad-CAM Heatmap' : 'Original Skin Image'}
              className="w-auto h-auto max-h-screen max-w-screen object-contain"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="20" fill="%239ca3af" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
              }}
            />
            <div className="absolute top-4 right-4 bg-white/90 text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer hover:bg-white transition-all">
              Close (ESC or Click)
            </div>
          </div>
        </div>
      )}

      {/* Normal Image Viewer */}
      <div className="relative bg-slate-50 rounded-xl overflow-hidden">
        <img
          src={displayUrl}
          alt={showHeatmap ? 'Grad-CAM Heatmap' : 'Original Skin Image'}
          onClick={() => setImageZoomed(true)}
          className="w-full h-auto object-contain max-h-96 cursor-zoom-in hover:opacity-95 transition-all"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="20" fill="%239ca3af" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
          }}
        />
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
