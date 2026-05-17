const config = {
  PENDING: {
    label: 'Pending Analysis',
    className: 'bg-yellow-100 text-yellow-800 \
ring-yellow-600/20'
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    className: 'bg-blue-100 text-blue-800 \
ring-blue-600/20'
  },
  RELEASED: {
    label: 'Result Ready',
    className: 'bg-green-100 text-green-800 \
ring-green-600/20'
  },
  RESUBMISSION_REQUIRED: {
    label: 'Resubmission Required',
    className: 'bg-red-100 text-red-800 \
ring-red-600/20'
  },
};

export default function StatusBadge({ status }) {
  const s = config[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-700 \
ring-gray-500/20'
  };

  return (
    <span className={`inline-flex items-center
      rounded-full px-2.5 py-1 text-xs font-medium
      ring-1 ring-inset ${s.className}`}>
      {s.label}
    </span>
  );
}