import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: (import.meta as any).env?.VITE_CLAUDE_API_KEY || '',
  dangerouslyAllowBrowser: true // Only for development - use backend in production
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
              text: `CRITICAL FIRST TASK: VALIDATE IMAGE CONTENT

STEP 1 - IMAGE VALIDATION (MANDATORY):
Examine the image carefully. Is this a CROP or AGRICULTURAL PLANT?

✅ VALID IMAGES (Continue to Step 2):
- Crop plants: rice, wheat, corn, tomato, chili, cotton, sugarcane, etc.
- Vegetable plants: cabbage, beans, lettuce, brinjal, etc.
- Field crops: any plant grown by farmers for agriculture
- Close-up of leaves, stems, fruits from farm crops

❌ INVALID IMAGES (Return error):
- Cars, vehicles, machinery
- People, animals, pets
- Buildings, houses, infrastructure
- Food items (cooked/processed)
- Decorative flowers (roses, orchids - NOT farm crops)
- Random objects, furniture, electronics
- Blank/unclear images

STEP 2 - IF VALID CROP IMAGE:
Identify what crop this is:
- Crop name in English
- Crop name in Tamil
- Set healthStatus to "Healthy" (for Phase 1, we're just identifying crops)
- Set confidence based on image clarity
- Simple description of what you see

RESPONSE FORMAT (JSON):

For VALID crop images:
{
  "cropType": "Tomato",
  "cropTypeTamil": "தக்காளி",
  "healthStatus": "Healthy",
  "diseaseName": null,
  "diseaseNameTamil": null,
  "confidenceScore": 90,
  "symptoms": "Image shows tomato plant with green leaves",
  "symptomsTamil": "படத்தில் பச்சை இலைகளுடன் தக்காளி செடி காட்டப்பட்டுள்ளது",
  "severity": null,
  "treatment": [],
  "treatmentTamil": [],
  "prevention": [],
  "preventionTamil": []
}

For INVALID (non-crop) images:
{
  "cropType": "Invalid Image",
  "cropTypeTamil": "தவறான படம்",
  "healthStatus": "Unknown",
  "diseaseName": null,
  "diseaseNameTamil": null,
  "confidenceScore": 0,
  "symptoms": "This image shows a [car/person/building/etc], not a crop. Please upload a photo of farm crops or plants.",
  "symptomsTamil": "இந்த படம் ஒரு [விளக்கம்], பயிர் அல்ல. தயவுசெய்து பண்ணை பயிர்கள் அல்லது தாவரங்களின் புகைப்படத்தை பதிவேற்றவும்.",
  "severity": null,
  "treatment": [],
  "treatmentTamil": [],
  "prevention": [],
  "preventionTamil": []
}

Return ONLY valid JSON, no additional text.`,
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