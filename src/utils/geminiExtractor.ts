const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export interface GeminiExtractionResult {
  exact_prescription_text: string;
  patient_id: string;
  patient_name: string;
  date_of_birth: string;
  gender: string;
  critical_medicines: string[];
  allergies: string[];
  accident_history: string[];
  last_updated: string;
  created_at: string;
}

export async function extractPrescriptionWithGemini(
  imageBase64: string,
  mimeType: string,
  patientId: string
): Promise<GeminiExtractionResult> {
  const prompt = `
  You are an expert clinical pharmacologist, physician, and elite medical AI specialized in decoding messy, handwritten doctor prescriptions.
  Your task is to analyze this prescription image with extreme accuracy and intelligence.

  CRITICAL INSTRUCTIONS:
  1. \`exact_prescription_text\`: Transcribe the raw text exactly as it appears. 
  2. \`critical_medicines\`: This is the MOST IMPORTANT field. Extract ONLY valid, verifiable pharmaceutical drugs and medications.
      - EXCLUDE symptoms or diagnoses (e.g. "Nausea", "Vomit", "Fever", "Cough").
      - EXCLUDE instructions or advice (e.g. "Strict bed rest for 3 Days", "Drink plenty of fluids", "Pediatric advised").
      - EXCLUDE random numbers, units without drug names, or illegible scribbles (e.g. "5 cfu", "Ha flavonomy", "9 fluid fev").
      - Include the dosage, route, frequency, and duration if present (e.g. "Tab Augmentin 625mg P/O BD x 5 days", "Syp. Cough Dr 5ml TDS", "IV Pan 40mg OD").
      - If an item is NOT a drug, DO NOT put it in this array under any circumstances.
  3. Since the patient is already registered in the system, set \`patient_name\`, \`date_of_birth\`, and \`gender\` to "Pre-filled from Registry" unless explicitly written differently on the paper. Extract \`allergies\` if visible.
  
  Respond STRICTLY with valid JSON matching EXACTLY this structure:
  {
    "exact_prescription_text": "string",
    "patient_id": "string",
    "patient_name": "string",
    "date_of_birth": "string",
    "gender": "string",
    "critical_medicines": ["string"],
    "allergies": ["string"],
    "accident_history": ["string"],
    "last_updated": "string",
    "created_at": "string"
  }
  
  Output nothing but the JSON.
  `;

  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error("VITE_OPENROUTER_API_KEY is not configured");
    }
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "NidiayU"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageBase64 } }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const contentText = data.choices?.[0]?.message?.content;
    
    if (!contentText) {
      throw new Error("Invalid response format from OpenRouter");
    }

    const cleanJson = contentText.replace(/^```(json)?\n?/, '').replace(/```$/, '').trim();
    const parsed: GeminiExtractionResult = JSON.parse(cleanJson);
    
    const nowIso = new Date().toISOString();
    parsed.patient_id = patientId;
    parsed.last_updated = nowIso;
    parsed.created_at = nowIso;

    return parsed;
  } catch (err) {
    console.error("Extraction failed:", err);
    throw err;
  }
}
