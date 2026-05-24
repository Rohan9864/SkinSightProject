import { useEffect, useState } from 'react';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../api/axios';

export default function AdminAuditLogsPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [filterAction, setFilterAction] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/audit-logs');
      setLogs(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load audit logs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // Get unique actions for filter
  const uniqueActions = [...new Set(logs.map((log) => log.action))];

  // Filter logs
  const filteredLogs = filterAction
    ? logs.filter((log) => log.action === filterAction)
    : logs;

  // Get action color
  const getActionColor = (action) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create') || actionLower.includes('submit'))
      return 'bg-emerald-100 text-emerald-700';
    if (actionLower.includes('delete') || actionLower.includes('remove'))
      return 'bg-rose-100 text-rose-700';
    if (actionLower.includes('update') || actionLower.includes('assigned'))
      return 'bg-sky-100 text-sky-700';
    if (actionLower.includes('review') || actionLower.includes('confirm'))
      return 'bg-violet-100 text-violet-700';
    return 'bg-slate-100 text-slate-700';
  };

  // Get action icon
  const getActionIcon = (action) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create') || actionLower.includes('submit')) return '📝';
    if (actionLower.includes('delete') || actionLower.includes('remove')) return '🗑️';
    if (actionLower.includes('update') || actionLower.includes('assigned')) return '✏️';
    if (actionLower.includes('review') || actionLower.includes('confirm')) return '✅';
    return '📋';
  };

  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Audit Logs</h1>
          <p className="text-sm text-slate-600 mt-1">
            {filteredLogs.length} log{filteredLogs.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filter */}
        {uniqueActions.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <label className="text-sm font-semibold text-slate-700 mb-3 block">
              Filter by Action
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterAction('')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  !filterAction
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {uniqueActions.map((action) => (
                <button
                  key={action}
                  onClick={() => setFilterAction(action)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    filterAction === action
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Logs List */}
        <div className="space-y-3">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="text-2xl flex-shrink-0 mt-0.5">
                    {getActionIcon(log.action)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                        <p className="text-sm font-semibold text-slate-800">
                          {log.performedByName || 'System'}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 flex-shrink-0">
                        {log.timestamp || log.createdAt ? (
                          new Date(log.timestamp || log.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            }
                          )
                        ) : (
                          'Invalid date'
                        )}
                      </p>
                    </div>

                    {/* Details */}
                    {log.description && (
                      <p className="text-sm text-slate-600 mb-2">{log.description}</p>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      {log.resourceType && (
                        <span>
                          <strong>Resource:</strong> {log.resourceType}
                        </span>
                      )}
                      {log.resourceId && (
                        <span>
                          <strong>ID:</strong> {log.resourceId}
                        </span>
                      )}
                      {log.changes && (
                        <span>
                          <strong>Changes:</strong> {typeof log.changes === 'string' ? log.changes : JSON.stringify(log.changes)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <ClipboardDocumentListIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No audit logs found</p>
            </div>
          )}
        </div>
      </div>
  );
}
