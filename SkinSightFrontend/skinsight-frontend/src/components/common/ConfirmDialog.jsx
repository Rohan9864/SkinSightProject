import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDangerous = false, // Red color for destructive actions
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4">
        {/* Icon & Message */}
        <div className="px-6 py-8 flex flex-col items-center text-center">
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
              isDangerous ? 'bg-rose-100' : 'bg-amber-100'
            }`}
          >
            <ExclamationTriangleIcon
              className={`w-6 h-6 ${isDangerous ? 'text-rose-600' : 'text-amber-600'}`}
            />
          </div>
          <p className="text-slate-700 text-sm">{message}</p>
        </div>

        {/* Buttons */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex gap-3 rounded-b-2xl">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:border-slate-300 hover:bg-slate-100 transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-lg text-white font-semibold transition-all ${
              isDangerous
                ? 'bg-rose-500 hover:bg-rose-600'
                : 'bg-sky-500 hover:bg-sky-600'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
