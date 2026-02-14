export interface Inspection {
  id: string;
  created_at: string;
  user_name: string;
  crop_type: string;
  crop_type_tamil: string | null;
  health_status: 'Healthy' | 'Stressed' | 'Diseased';
  disease_name: string | null;
  disease_name_tamil: string | null;
  confidence_score: number;
  symptoms: string;
  symptoms_tamil: string | null;
  severity: 'Mild' | 'Moderate' | 'Severe' | null;
  image_url: string;
  treatment: string[];
  treatment_tamil: string[];
  prevention: string[];
  prevention_tamil: string[];
}
