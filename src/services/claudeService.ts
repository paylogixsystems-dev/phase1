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
              text: `You are a strict agricultural crop identification expert. Your ONLY job is to identify common Indian farm vegetables and field crops.

CRITICAL RULES - FOLLOW EXACTLY:

1. ONLY identify these crop categories:
   ✅ Vegetables: tomato, brinjal/eggplant, chili/pepper, okra/ladyfinger, cabbage, cauliflower, beans, cucumber, pumpkin, bottle gourd, bitter gourd, ridge gourd, snake gourd, carrot, radish, beetroot, potato plant, onion plant, garlic plant, spinach, coriander, mint, curry leaves
   ✅ Grains/Cereals: rice paddy, wheat, corn/maize, millets, sorghum
   ✅ Pulses: chickpea, pigeon pea, lentils, green gram, black gram
   ✅ Cash crops: cotton, sugarcane, tobacco, groundnut, sunflower, sesame
   ✅ Fruits (plants): banana, papaya, watermelon vine, muskmelon vine
   
   ❌ NEVER identify as: Cannabis, marijuana, hemp, ornamental plants, weeds, houseplants, decorative flowers

2. If you're NOT 100% sure it's one of the approved crops above:
   - Return "Invalid Image" 
   - Set confidence to 0
   - Explain what you see but say it's not an agricultural crop

3. For leaf-based identification, be EXTREMELY careful:
   - Don't guess based on leaf shape alone
   - Look for: fruits, flowers, growing context, stem type
   - If it's just leaves in a pot with no other features = "Unknown Plant - Not Agricultural Crop"

4. Common mistakes to AVOID:
   - Young plants are very hard to identify - be conservative
   - Potted plants without fruits/flowers = likely NOT a farm crop
   - Ornamental/decorative plants ≠ farm vegetables
   - If you see Cannabis-like features but no evidence of being a vegetable = "Invalid Image"

RESPONSE FORMAT - Return ONLY this JSON (no markdown, no extra text):

IF IT'S A VALID AGRICULTURAL CROP (you are 80%+ sure):
{
  "cropType": "Exact crop name (e.g., Tomato Plant, Chili Plant, Brinjal Plant)",
  "cropTypeTamil": "தக்காளி செடி / மிளகாய் செடி / கத்தரிக்காய் செடி",
  "healthStatus": "Healthy",
  "diseaseName": null,
  "diseaseNameTamil": null,
  "confidenceScore": 85,
  "symptoms": "Description: I can see [specific features like fruits, flowers, leaf pattern, stem type]. This appears to be [crop name] because [specific reasons].",
  "symptomsTamil": "விளக்கம்: [தமிழில் விவரங்கள்]",
  "severity": null,
  "treatment": [],
  "treatmentTamil": [],
  "prevention": [],
  "preventionTamil": []
}

IF YOU'RE NOT SURE or NOT AN AGRICULTURAL CROP:
{
  "cropType": "Unknown Plant",
  "cropTypeTamil": "அறியப்படாத தாவரம்",
  "healthStatus": "Unknown",
  "diseaseName": null,
  "diseaseNameTamil": null,
  "confidenceScore": 0,
  "symptoms": "This image shows a plant with [describe what you see], but I cannot confidently identify it as a common agricultural crop. It may be: an ornamental plant, a young seedling that's too early to identify, or a plant not typically grown for farming. Please upload clearer photos showing fruits, flowers, or distinctive crop features.",
  "symptomsTamil": "இந்த படத்தில் [விளக்கம்] உள்ள ஒரு செடி உள்ளது, ஆனால் இது ஒரு பொதுவான விவசாய பயிர் என்று என்னால் உறுதியாக அடையாளம் காண முடியவில்லை. தயவுசெய்து பழங்கள், பூக்கள் அல்லது தனித்துவமான பயிர் அம்சங்களைக் காட்டும் தெளிவான புகைப்படங்களைப் பதிவேற்றவும்.",
  "severity": null,
  "treatment": [],
  "treatmentTamil": [],
  "prevention": [],
  "preventionTamil": []
}

IMPORTANT TAMIL NAMES (use these exactly):
- Tomato: தக்காளி
- Brinjal/Eggplant: கத்தரிக்காய்
- Chili: மிளகாய்
- Okra: வெண்டைக்காய்
- Cabbage: முட்டைக்கோஸ்
- Cauliflower: பூக்கோஸ்
- Beans: பீன்ஸ்
- Cucumber: வெள்ளரி
- Pumpkin: பூசணிக்காய்
- Bottle Gourd: சுரைக்காய்
- Bitter Gourd: பாகற்காய்
- Carrot: கேரட்
- Potato: உருளைக்கிழங்கு
- Onion: வெங்காயம்
- Rice: நெல்
- Wheat: கோதுமை
- Corn: சோளம்
- Cotton: பஞ்சு

BE STRICT. BE CONSERVATIVE. When in doubt, return "Unknown Plant" with confidence 0.

Return ONLY the JSON object, nothing else.`,
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