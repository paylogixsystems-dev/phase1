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
              text: `You are an expert agricultural botanist specializing in Indian crop identification. Analyze this image with extreme precision.

CRITICAL INSTRUCTIONS:

STEP 1 - VALIDATE IMAGE TYPE:
Is this an AGRICULTURAL CROP or VEGETABLE PLANT grown by farmers?

✅ ACCEPT:
- Vegetables: tomato, brinjal, chili, cabbage, beans, okra, cucumber, bottle gourd, bitter gourd, pumpkin, spinach, coriander
- Grains: rice, wheat, corn, millet, sorghum
- Cash crops: cotton, sugarcane, tobacco, groundnut, sunflower
- Pulses: lentils, chickpeas, pigeon pea, green gram, black gram
- Fruits: banana, papaya, guava, mango (tree leaves)
- Plantation: tea, coffee, rubber

❌ REJECT:
- Cannabis/marijuana (NEVER identify as agricultural crop)
- Ornamental plants (roses, tulips, orchids, indoor plants)
- Wild plants, weeds
- Non-plants (cars, people, buildings, food items)

STEP 2 - CAREFUL IDENTIFICATION:
Look at these features CAREFULLY:
1. Leaf shape and arrangement (alternate, opposite, whorled)
2. Leaf edges (smooth, serrated, lobed)
3. Leaf texture (glossy, fuzzy, rough)
4. Stem characteristics
5. Visible fruits/flowers if any
6. Growing context (pot, field, garden)

Common misidentifications to AVOID:
- Cannabis vs Hibiscus (both have palmate leaves)
- Cannabis vs Cassava/Tapioca (both have finger-like leaves)
- Cannabis vs certain squash/gourd plants
- Young plants are harder - be conservative with confidence

BE CONSERVATIVE: If unsure between multiple crops, choose the most common agricultural one in India, or lower confidence score.

STEP 3 - RESPONSE FORMAT:

For AGRICULTURAL CROPS:
{
  "cropType": "Brinjal Plant" (or "Tomato", "Chili", etc.),
  "cropTypeTamil": "கத்தரிக்காய்" (correct Tamil name),
  "healthStatus": "Healthy",
  "diseaseName": null,
  "diseaseNameTamil": null,
  "confidenceScore": 85 (0-100, be realistic),
  "symptoms": "Green leafy plant with broad leaves, appears to be a young brinjal/eggplant based on leaf shape and arrangement. Planted in pot.",
  "symptomsTamil": "பரந்த இலைகளுடன் பச்சை இலை செடி, இலை வடிவம் மற்றும் அமைப்பின் அடிப்படையில் இளம் கத்தரிக்காய் போல் தெரிகிறது.",
  "severity": null,
  "treatment": [],
  "treatmentTamil": [],
  "prevention": [],
  "preventionTamil": []
}

For NON-CROPS:
{
  "cropType": "Invalid Image",
  "cropTypeTamil": "தவறான படம்",
  "healthStatus": "Unknown",
  "diseaseName": null,
  "diseaseNameTamil": null,
  "confidenceScore": 0,
  "symptoms": "This appears to be [describe what you see], which is not an agricultural crop. Please upload photos of farm-grown vegetables, grains, or cash crops.",
  "symptomsTamil": "இது [விளக்கம்], இது ஒரு விவசாய பயிர் அல்ல. தயவுசெய்து பண்ணையில் வளர்க்கப்படும் காய்கறிகள், தானியங்கள் அல்லது பணப்பயிர்களின் புகைப்படங்களை பதிவேற்றவும்.",
  "severity": null,
  "treatment": [],
  "treatmentTamil": [],
  "prevention": [],
  "preventionTamil": []
}

IMPORTANT TAMIL CROP NAMES (use correct ones):
- Tomato: தக்காளி
- Brinjal/Eggplant: கத்தரிக்காய்
- Chili: மிளகாய்
- Okra: வெண்டைக்காய்
- Bottle Gourd: சுரைக்காய்
- Bitter Gourd: பாகற்காய்
- Rice: நெல் / அரிசி
- Wheat: கோதுமை
- Corn: சோளம்
- Cotton: பஞ்சு / பருத்தி

Return ONLY valid JSON. No markdown, no explanation, just the JSON object.`,
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