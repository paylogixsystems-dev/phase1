import React, { useState } from 'react';
import { Clock, Trash2, CheckCircle, AlertTriangle, XCircle, Leaf } from 'lucide-react';
import { Inspection } from '../types';
import InspectionDetailModal from './InspectionDetailModal';

interface Props {
  inspections: Inspection[];
  onDelete: (id: string) => void;
}

const History: React.FC<Props> = ({ inspections, onDelete }) => {
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy': return 'bg-green-100 text-green-800';
      case 'Stressed': return 'bg-amber-100 text-amber-800';
      case 'Diseased': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Healthy': return <CheckCircle className="w-4 h-4" />;
      case 'Stressed': return <AlertTriangle className="w-4 h-4" />;
      case 'Diseased': return <XCircle className="w-4 h-4" />;
      default: return <Leaf className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (inspections.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 p-4 pb-24">
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-200 rounded-full mb-4">
            <Clock className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">No Inspections Yet</h2>
          <p className="text-gray-500">Start scanning crops to see your history here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 p-4 pb-24">
      <InspectionDetailModal 
        inspection={selectedInspection}
        onClose={() => setSelectedInspection(null)}
      />
      
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-green-900 mb-1">Inspection History</h1>
          <p className="text-green-700 text-sm">{inspections.length} total scans</p>
        </div>

        <div className="space-y-4">
          {inspections.map((inspection) => (
            <div key={inspection.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-green-100">
              <div className="flex">
                {/* Clickable Content Area */}
                <div 
                  className="flex flex-1 p-4 space-x-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedInspection(inspection)}
                >
                  {/* Image */}
                  <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
                    <img 
                      src={inspection.image_url} 
                      alt={inspection.crop_type}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 truncate mb-1">{inspection.crop_type}</h3>
                    {inspection.crop_type_tamil && (
                      <p className="text-xs text-green-700 truncate mb-2">{inspection.crop_type_tamil}</p>
                    )}

                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(inspection.health_status)}`}>
                        {getStatusIcon(inspection.health_status)}
                        <span>{inspection.health_status}</span>
                      </span>
                      {inspection.disease_name && (
                        <span className="text-xs text-red-600 truncate font-medium">
                          {inspection.disease_name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(inspection.created_at)}</span>
                      </span>
                      <span className="font-semibold text-green-600">{inspection.confidence_score}%</span>
                    </div>
                  </div>
                </div>

                {/* Delete Button (outside clickable area) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this inspection?')) {
                      onDelete(inspection.id);
                    }
                  }}
                  className="p-4 hover:bg-red-50 transition-colors flex items-center justify-center border-l border-gray-100"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;