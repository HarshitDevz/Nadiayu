import { OpenRouter } from '@openrouter/sdk';
import { CriticalPatientExtract, ExtractedMedication, Patient } from '../types';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

let openrouter: OpenRouter | null = null;
if (OPENROUTER_API_KEY) {
  openrouter = new OpenRouter({ apiKey: OPENROUTER_API_KEY });
}

export interface OcrExtractionResult {
  critical: CriticalPatientExtract;
  medications: ExtractedMedication[];
}

export async function extractPrescriptionWithAI(
  text: string,
  patient: Patient | null,
  imageUri?: string
): Promise<OcrExtractionResult> {
  if (!openrouter) {
    console.warn("No VITE_OPENROUTER_API_KEY provided. Falling back to mock data.");
    // Fallback if no key is provided to prevent crash
    return {
      critical: { critical_meds: [], accident_history: [], allergies: [] },
      medications: []
    };
  }

  const patientContext = patient ? `
    Patient Name: ${patient.name}
    Past Allergies: ${patient.allergies.map(a => a.allergen).join(', ')}
    Past Medical History: ${patient.primaryDiagnosis}
  ` : 'No prior patient history available.';

  const prompt = `
    You are a highly advanced Clinical AI Assistant.
    Your task is to analyze the following prescription/emergency medical text and extract structured information.
    
    Context about the patient:
    ${patientContext}
    
    Raw Medical Text to process:
    """
    ${text}
    """

    CORE RESPONSIBILITIES:
    1. Extract all medications prescribed.
    2. Identify critical/harmful items (anticoagulants, steroids, opioids, high-risk drugs) and place them in 'critical_meds'.
    3. Identify accident/trauma history and place in 'accident_history'.
    4. Identify allergies mentioned in the text or relevant cross-reactions and place in 'allergies'.
    
    Filter out routine medications (like vitamins or paracetamol) from the 'critical_meds' array, but INCLUDE them in the general 'medications' array.
    Compare new inputs with the past patient context and mark status as "new entry" or "previously recorded".
    
    Respond STRICTLY with valid JSON matching exactly this TypeScript interface structure:
    
    {
      "critical": {
        "critical_meds": [{ "drug": string, "dose": string, "frequency": string, "status": "new entry" | "previously recorded", "category": string }],
        "accident_history": [{ "event": string, "status": "new entry" | "previously recorded" }],
        "allergies": [{ "drug": string, "reaction": string, "status": "new entry" | "previously recorded" }]
      },
      "medications": [
        { "id": string, "rawText": string, "parsedName": string, "dosage": string, "frequency": string, "route": string, "confidence": number, "isAllergyConflict": boolean }
      ]
    }
    
    Ensure 'id' for medications is a unique string. Confidence should be a number between 0 and 100.
    Output nothing but the JSON.
  `;

  try {
    let messageContent: any = prompt;
    let model = "google/gemma-4-31b-it:free";

    // If an image is provided, switch to a vision-capable model and format content as an array
    if (imageUri) {
      model = "anthropic/claude-3-haiku";
      messageContent = [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: imageUri } }
      ];
    }

    const response = await openrouter.chat.send({
      chatRequest: {
        model,
        messages: [{ role: "user", content: messageContent }],
      }
    });

    const content = response.choices[0]?.message?.content || "{}";
    
    // Clean markdown formatting if present
    const cleanJson = content.replace(/^```(json)?\n?/, '').replace(/```$/, '').trim();
    
    const parsed = JSON.parse(cleanJson);
    return {
      critical: parsed.critical || { critical_meds: [], accident_history: [], allergies: [] },
      medications: parsed.medications || []
    };
  } catch (error) {
    console.error("OpenRouter Extraction Error:", error);
    throw error;
  }
}
