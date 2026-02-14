import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: import.meta.env.VITE_CLAUDE_API_KEY,
  dangerouslyAllowBrowser: true // Only for development - use backend in production
});

export interface CropAnalysis {
  cropType: string;
  cropTypeTamil: string;
  healthStatus: 'Healthy' | 'Stressed' | 'Diseased';
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
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: `You are an expert agricultural pathologist and crop disease specialist analyzing this crop image.

CRITICAL ANALYSIS REQUIRED:

1. **IDENTIFY THE CROP TYPE**
   - What specific crop is this? (rice, wheat, tomato, cotton, corn, etc.)
   - Provide both English and Tamil names

2. **DETECT DISEASES/PROBLEMS**
   - Look for: leaf spots, discoloration, wilting, holes, mold, pests, nutrient deficiency
   - If disease detected: Name it specifically (e.g., "Late Blight", "Bacterial Leaf Spot", "Rice Blast")
   - If healthy: State "No Disease Detected"
   - Rate severity: Mild, Moderate, or Severe

3. **HEALTH STATUS**
   - Healthy: No visible problems
   - Stressed: Early symptoms, nutrient issues, water stress
   - Diseased: Active infection or pest damage

4. **SYMPTOMS** (be specific)
   - Describe what you see: color changes, patterns, location on plant
   - Include size and spread of affected areas

5. **TREATMENT** (actionable steps)
   - If diseased: Recommend specific fungicides, pesticides, or organic treatments
   - Include application rates and timing
   - If healthy: Maintenance care only

6. **PREVENTION** (future crop protection)
   - Cultural practices to prevent recurrence
   - Crop rotation, spacing, irrigation tips

RESPONSE FORMAT (JSON):
{
  "cropType": "Tomato",
  "cropTypeTamil": "தக்காளி",
  "healthStatus": "Diseased",
  "diseaseName": "Early Blight",
  "diseaseNameTamil": "ஆரம்ப கருகல் நோய்",
  "confidenceScore": 85,
  "symptoms": "Circular brown spots with concentric rings on lower leaves, yellowing around spots",
  "symptomsTamil": "கீழ் இலைகளில் வட்ட வடிவ பழுப்பு புள்ளிகள், புள்ளிகளைச் சுற்றி மஞ்சள் நிறம்",
  "severity": "Moderate",
  "treatment": [
    "Apply Mancozeb fungicide (2g per liter) immediately",
    "Remove and destroy heavily infected leaves",
    "Spray every 7-10 days for 3 weeks",
    "Ensure good air circulation between plants"
  ],
  "treatmentTamil": [
    "உடனடியாக மான்கோசெப் பூஞ்சைக் கொல்லி (லிட்டருக்கு 2 கிராம்) தெளிக்கவும்",
    "மோசமாக பாதிக்கப்பட்ட இலைகளை அகற்றி அழிக்கவும்",
    "3 வாரங்களுக்கு ஒவ்வொரு 7-10 நாட்களுக்கும் தெளிக்கவும்",
    "செடிகளுக்கு இடையே நல்ல காற்றோட்டம் உறுதி செய்யவும்"
  ],
  "prevention": [
    "Practice crop rotation - don't plant tomatoes in same spot for 3 years",
    "Water at soil level, avoid wetting leaves",
    "Space plants 60cm apart for air flow",
    "Apply mulch to prevent soil splash"
  ],
  "preventionTamil": [
    "பயிர் சுழற்சி - 3 ஆண்டுகளுக்கு அதே இடத்தில் தக்காளி நடாதீர்கள்",
    "மண் மட்டத்தில் நீர் பாய்ச்சவும், இலைகளை நனைக்க வேண்டாம்",
    "காற்றோட்டத்திற்காக 60 செமீ இடைவெளியில் செடிகளை நடவும்",
    "மண் தெறிப்பதைத் தடுக்க தழைக்கூளம் இடவும்"
  ]
}

Return ONLY valid JSON, no additional text. If the image is not a crop/plant, return healthStatus: "Unknown" and explain in symptoms.`,
            },
          ],
        },
      ],
    });

    // Extract JSON from response
    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Parse JSON (Claude sometimes wraps in ```json```)
    let jsonText = textContent.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const analysis: CropAnalysis = JSON.parse(jsonText);
    
    // Validate required fields
    if (!analysis.cropType || !analysis.healthStatus) {
      throw new Error('Invalid response format from Claude');
    }

    return analysis;
    
  } catch (error) {
    console.error('Claude API Error:', error);
    throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
