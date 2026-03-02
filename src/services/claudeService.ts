import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: (import.meta as any).env?.VITE_CLAUDE_API_KEY || '',
  dangerouslyAllowBrowser: true
});

export interface CropAnalysis {
  cropType: string;
  cropTypeTamil: string;
  healthStatus: 'Healthy' | 'Stressed' | 'Diseased' | 'Unknown';
  diseaseName: string | null;
  diseaseNameTamil: string | null;
  confidenceScore: number;
  symptoms: string;
  symptomsTamil: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | null;
  treatment: string[];
  treatmentTamil: string[];
  prevention: string[];
  preventionTamil: string[];
}

export const analyzeCropImage = async (base64Image: string): Promise<CropAnalysis> => {
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: [{
          type: 'image',
          source: { type: 'base64', media_type: 'image/jpeg', data: base64Image }
        }, {
          type: 'text',
          text: `You are an expert at identifying anything in images.

Analyze this image and tell me:
1. What is the main subject? (be specific - type of dog, car model, plant name, etc.)
2. Describe what you see
3. Provide in English AND Tamil

Return ONLY this JSON format:

{
  "cropType": "Specific identification (e.g., Golden Retriever Dog, Red Toyota Car, Tomato Plant, Apple, etc.)",
  "cropTypeTamil": "தமிழ் பெயர் (e.g., கோல்டன் ரிட்ரீவர் நாய், சிவப்பு கார், தக்காளி செடி, ஆப்பிள்)",
  "healthStatus": "Healthy",
  "diseaseName": null,
  "diseaseNameTamil": null,
  "confidenceScore": 85,
  "symptoms": "Detailed description in English of what you see. Be specific about colors, features, condition, etc.",
  "symptomsTamil": "தமிழில் விரிவான விளக்கம். நீங்கள் பார்ப்பதை விவரிக்கவும்.",
  "severity": null,
  "treatment": [],
  "treatmentTamil": [],
  "prevention": [],
  "preventionTamil": []
}

Be specific. Identify ANYTHING - animals, vehicles, plants, food, people, buildings, objects.
Return ONLY JSON, no extra text.`
        }]
      }]
    });

    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No response from Claude');
    }

    let jsonText = textContent.text.trim();
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    
    const analysis: CropAnalysis = JSON.parse(jsonText);
    return analysis;
    
  } catch (error) {
    console.error('Claude API Error:', error);
    throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};