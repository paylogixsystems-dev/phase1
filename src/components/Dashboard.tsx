import React, { useState } from 'react';
import { Camera, CheckCircle, AlertTriangle, XCircle, TrendingUp, Calendar, Leaf } from 'lucide-react';
import { Inspection } from '../types';
import InspectionDetailModal from './InspectionDetailModal';

interface Props {
  inspections: Inspection[];
  userName: string;
}

const Dashboard: React.FC<Props> = ({ inspections, userName }) => {
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  
  const totalScans = inspections.length;
  const healthyCount = inspections.filter(i => i.health_status === 'Healthy').length;
  const stressedCount = inspections.filter(i => i.health_status === 'Stressed').length;
  const diseasedCount = inspections.filter(i => i.health_status === 'Diseased').length;

  const recentScans = inspections.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy': return 'bg-green-100 text-green-700 border-green-200';
      case 'Stressed': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Diseased': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 p-4 pb-24">
      <InspectionDetailModal 
        inspection={selectedInspection}
        onClose={() => setSelectedInspection(null)}
      />
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Welcome back, {userName}!</h1>
              <p className="text-green-50 text-sm">Here's your farm analysis overview</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <Leaf className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Scans */}
          <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Camera className="w-5 h-5 text-blue-600" />
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-gray-800">{totalScans}</div>
            <div className="text-xs text-gray-500 mt-1">Total Scans</div>
          </div>

          {/* Healthy */}
          <div className="bg-white rounded-2xl p-5 shadow-md border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-700">{healthyCount}</div>
            <div className="text-xs text-gray-500 mt-1">Healthy</div>
          </div>

          {/* Stressed */}
          <div className="bg-white rounded-2xl p-5 shadow-md border border-amber-100">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-3xl font-bold text-amber-700">{stressedCount}</div>
            <div className="text-xs text-gray-500 mt-1">Stressed</div>
          </div>

          {/* Diseased */}
          <div className="bg-white rounded-2xl p-5 shadow-md border border-red-100">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-red-700">{diseasedCount}</div>
            <div className="text-xs text-gray-500 mt-1">Diseased</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-green-600" />
              Recent Activity
            </h2>
            <span className="text-sm text-gray-500">{recentScans.length} recent</span>
          </div>

          {recentScans.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No scans yet</p>
              <p className="text-sm text-gray-400 mt-1">Start by scanning your first crop</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentScans.map((inspection) => (
                <div
                  key={inspection.id}
                  onClick={() => setSelectedInspection(inspection)}
                  className="flex items-center space-x-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl cursor-pointer transition-all active:scale-98 border border-gray-200"
                >
                  {/* Image */}
                  <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 border-white shadow-sm">
                    <img 
                      src={inspection.image_url} 
                      alt={inspection.crop_type}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 truncate">{inspection.crop_type}</h3>
                    <p className="text-sm text-gray-500 truncate">{formatDate(inspection.created_at)}</p>
                  </div>

                  {/* Status */}
                  <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(inspection.health_status)}`}>
                    {getStatusIcon(inspection.health_status)}
                    <span>{inspection.health_status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Action */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1">Ready to scan?</h3>
              <p className="text-blue-100 text-sm">Analyze your crops with AI</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <Camera className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;