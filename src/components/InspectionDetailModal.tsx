import React from 'react';
import { X, CheckCircle, AlertTriangle, XCircle, Leaf, Calendar } from 'lucide-react';
import { Inspection } from '../types';

interface Props {
  inspection: Inspection | null;
  onClose: () => void;
}

const InspectionDetailModal: React.FC<Props> = ({ inspection, onClose }) => {
  if (!inspection) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy': return 'text-green-700 bg-green-50 border-green-200';
      case 'Stressed': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Diseased': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Healthy': return <CheckCircle className="w-5 h-5" />;
      case 'Stressed': return <AlertTriangle className="w-5 h-5" />;
      case 'Diseased': return <XCircle className="w-5 h-5" />;
      default: return <Leaf className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-xl font-bold text-gray-800">Scan Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm">
            <img 
              src={inspection.image_url} 
              alt={inspection.crop_type}
              className="w-full h-64 object-cover"
            />
          </div>

          {/* Timestamp */}
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(inspection.created_at)}</span>
          </div>

          {/* Crop Info */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-100">
            <p className="text-xs text-green-600 font-semibold mb-2 uppercase tracking-wider">Crop Identified</p>
            <h3 className="text-2xl font-bold text-green-900 mb-1">{inspection.crop_type}</h3>
            {inspection.crop_type_tamil && (
              <p className="text-lg text-green-700 font-medium">{inspection.crop_type_tamil}</p>
            )}
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-600">AI Confidence</span>
              <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                {inspection.confidence_score}%
              </span>
            </div>
          </div>

          {/* Health Status */}
          <div className={`rounded-2xl p-5 border-2 ${getStatusColor(inspection.health_status)}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon(inspection.health_status)}
                <span className="text-lg font-bold">{inspection.health_status}</span>
              </div>
              {inspection.severity && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/50">
                  {inspection.severity}
                </span>
              )}
            </div>

            {inspection.disease_name && (
              <div className="mb-4 pb-4 border-b border-current/20">
                <p className="text-sm font-semibold mb-1">Disease Detected:</p>
                <p className="font-bold">{inspection.disease_name}</p>
                {inspection.disease_name_tamil && (
                  <p className="text-sm font-medium opacity-90 mt-1">{inspection.disease_name_tamil}</p>
                )}
              </div>
            )}

            <div>
              <p className="text-sm font-semibold mb-2">Observations:</p>
              <p className="text-sm leading-relaxed">{inspection.symptoms}</p>
              {inspection.symptoms_tamil && (
                <p className="text-sm leading-relaxed mt-2 opacity-90 italic">{inspection.symptoms_tamil}</p>
              )}
            </div>
          </div>

          {/* Treatment (if available) */}
          {inspection.treatment && inspection.treatment.length > 0 && (
            <div className="bg-blue-50 rounded-2xl p-5 border-2 border-blue-100">
              <h4 className="font-bold text-blue-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                Treatment Plan
              </h4>
              <div className="space-y-3">
                {inspection.treatment.map((step, i) => (
                  <div key={i} className="border-l-2 border-blue-300 pl-4">
                    <p className="text-sm text-gray-800 mb-1">• {step}</p>
                    {inspection.treatment_tamil[i] && (
                      <p className="text-xs text-blue-700 italic">{inspection.treatment_tamil[i]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prevention (if available) */}
          {inspection.prevention && inspection.prevention.length > 0 && (
            <div className="bg-purple-50 rounded-2xl p-5 border-2 border-purple-100">
              <h4 className="font-bold text-purple-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                Prevention Tips
              </h4>
              <div className="space-y-3">
                {inspection.prevention.map((tip, i) => (
                  <div key={i} className="border-l-2 border-purple-300 pl-4">
                    <p className="text-sm text-gray-800 mb-1">• {tip}</p>
                    {inspection.prevention_tamil[i] && (
                      <p className="text-xs text-purple-700 italic">{inspection.prevention_tamil[i]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 p-6 rounded-b-3xl">
          <button
            onClick={onClose}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-4 rounded-xl transition-all active:scale-98"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InspectionDetailModal;