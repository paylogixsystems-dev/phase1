import React, { useState, useRef } from 'react';
import { Camera, Loader2, CheckCircle, AlertTriangle, XCircle, Leaf, Upload } from 'lucide-react';
import { analyzeCropImage } from '../services/claudeService';
import { supabase } from '../services/supabaseClient';
import { Inspection } from '../types';

interface Props {
  userName: string;
  onAnalysisComplete: (inspection: Inspection) => void;
}

const Scanner: React.FC<Props> = ({ userName, onAnalysisComplete }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Inspection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      
      // Compress large images (especially drone photos)
      compressImage(base64String, (compressed) => {
        setPreview(compressed);
        setResult(null);
        setError(null);
      });
    };
    reader.readAsDataURL(file);
  };

  const compressImage = (base64: string, callback: (compressed: string) => void) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // Max dimensions - keeps quality good for AI analysis
      const MAX_WIDTH = 1920;
      const MAX_HEIGHT = 1920;
      
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      // Compress to JPEG with 85% quality (good for AI + smaller size)
      const compressed = canvas.toDataURL('image/jpeg', 0.85);
      callback(compressed);
    };
    img.onerror = () => {
      // If image load fails, use original
      callback(base64);
    };
    img.src = base64;
  };

  const analyzeImage = async () => {
    if (!preview || !supabase) {
      setError('Missing image or database connection');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get base64 data
      const base64Data = preview.split(',')[1];
      
      // Analyze with Claude
      const analysis = await analyzeCropImage(base64Data);

      // Save to Supabase
      const { data, error: dbError } = await supabase
        .from('inspections')
        .insert([
          {
            user_name: userName,
            crop_type: analysis.cropType,
            crop_type_tamil: analysis.cropTypeTamil,
            health_status: analysis.healthStatus,
            disease_name: analysis.diseaseName,
            disease_name_tamil: analysis.diseaseNameTamil,
            confidence_score: analysis.confidenceScore,
            symptoms: analysis.symptoms,
            symptoms_tamil: analysis.symptomsTamil,
            severity: analysis.severity,
            image_url: preview,
            treatment: analysis.treatment,
            treatment_tamil: analysis.treatmentTamil,
            prevention: analysis.prevention,
            prevention_tamil: analysis.preventionTamil,
          },
        ])
        .select()
        .single();

      if (dbError) throw dbError;
      if (!data) throw new Error('No data returned from database');

      // Check if it was an invalid image
      if (analysis.healthStatus === 'Unknown' || analysis.cropType === 'Invalid Image') {
        setError(analysis.symptoms); // Show the rejection message
        return;
      }

      setResult(data);
      onAnalysisComplete(data);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 p-4 pb-20">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-3 shadow-lg">
          <Leaf className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-green-900 mb-2">Image Analyzer</h1>
        <p className="text-green-700 text-sm">AI-powered identification in English & Tamil</p>
      </div>

      {/* Camera/Upload Section */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-green-200">
          
          {/* Hidden file inputs - TWO SEPARATE */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Image Preview */}
          <div className="relative border-4 border-dashed border-green-300 bg-gray-50">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-80 object-cover" />
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-green-600">
                <Camera className="w-16 h-16 mb-4" />
                <p className="text-lg font-semibold">Upload or Capture Photo</p>
                <p className="text-sm text-green-500 mt-2">Choose option below</p>
              </div>
            )}
          </div>

          {/* Camera and Gallery Buttons */}
          {!preview && (
            <div className="p-4 grid grid-cols-2 gap-3">
              {/* CAMERA BUTTON */}
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex flex-col items-center justify-center py-4 bg-green-50 hover:bg-green-100 rounded-xl border-2 border-green-200 transition-all active:scale-95"
              >
                <Camera className="w-8 h-8 text-green-600 mb-2" />
                <span className="text-sm font-semibold text-green-800">Open Camera</span>
              </button>
              
              {/* GALLERY BUTTON */}
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="flex flex-col items-center justify-center py-4 bg-blue-50 hover:bg-blue-100 rounded-xl border-2 border-blue-200 transition-all active:scale-95"
              >
                <Upload className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm font-semibold text-blue-800">Choose Gallery</span>
              </button>
            </div>
          )}
        </div>

        {/* Analyze Button */}
        {preview && (
          <button
            onClick={analyzeImage}
            disabled={loading}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Leaf className="w-6 h-6" />
                <span>Analyze Image</span>
              </>
            )}
          </button>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start space-x-3">
            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Main Identification */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-600">
            <p className="text-xs text-green-600 font-semibold mb-1 uppercase tracking-wider">Identified As</p>
            <h2 className="text-2xl font-bold text-green-900">{result.crop_type}</h2>
            {result.crop_type_tamil && (
              <p className="text-lg text-green-700 font-medium mt-1">{result.crop_type_tamil}</p>
            )}
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm text-gray-600">Confidence</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                {result.confidence_score}%
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Description</h4>
            <p className="text-gray-700 text-sm leading-relaxed mb-3">{result.symptoms}</p>
            {result.symptoms_tamil && (
              <p className="text-green-700 text-sm font-medium leading-relaxed italic border-t border-gray-100 pt-3">
                {result.symptoms_tamil}
              </p>
            )}
          </div>

          {/* Health Status (if applicable) */}
          {result.health_status !== 'Unknown' && (
            <div className={`rounded-2xl shadow-lg p-6 border-2 ${getStatusColor(result.health_status)}`}>
              <div className="flex items-center space-x-3">
                {getStatusIcon(result.health_status)}
                <span className="text-lg font-bold">{result.health_status}</span>
              </div>
              {result.disease_name && (
                <div className="mt-3 pt-3 border-t border-current/20">
                  <p className="text-sm font-semibold">Disease: {result.disease_name}</p>
                  {result.disease_name_tamil && (
                    <p className="text-sm opacity-90 mt-1">{result.disease_name_tamil}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Treatment (if available) */}
          {result.treatment && result.treatment.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-600">
              <h4 className="font-bold text-blue-900 mb-4">Treatment Plan</h4>
              <div className="space-y-3">
                {result.treatment.map((step, i) => (
                  <div key={i} className="border-l-2 border-blue-200 pl-4">
                    <p className="text-sm text-gray-800 mb-1">• {step}</p>
                    {result.treatment_tamil[i] && (
                      <p className="text-xs text-blue-700 italic">{result.treatment_tamil[i]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prevention (if available) */}
          {result.prevention && result.prevention.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-600">
              <h4 className="font-bold text-purple-900 mb-4">Prevention Tips</h4>
              <div className="space-y-3">
                {result.prevention.map((tip, i) => (
                  <div key={i} className="border-l-2 border-purple-200 pl-4">
                    <p className="text-sm text-gray-800 mb-1">• {tip}</p>
                    {result.prevention_tamil[i] && (
                      <p className="text-xs text-purple-700 italic">{result.prevention_tamil[i]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Scanner;