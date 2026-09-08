// Edge function: analyze a medical report using LLM (OpenAI/Gemini)
// Accepts: { reportText?: string, imageBase64?: string, mimeType?: string, patientNote?: string }
// Returns: { summary, findings[], possibleConditions[], prescription[], lifestyle[], redFlags[], disclaimer }

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY") || Deno.env.get("GEMINI_API_KEY") || Deno.env.get("AI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured. Please set OPENAI_API_KEY or GEMINI_API_KEY in Supabase." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { reportText, imageBase64, mimeType, patientNote } = await req.json();

    if (!reportText && !imageBase64) {
      return new Response(JSON.stringify({ error: "Provide reportText or imageBase64" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are an expert medical assistant AI. Analyze the patient's medical report and produce a clear, structured response.
Return STRICT JSON only matching this schema (no markdown, no extra text):
{
  "summary": string,
  "findings": string[],
  "possibleConditions": [{ "name": string, "likelihood": "Low"|"Moderate"|"High", "rationale": string }],
  "prescription": [{ "medicine": string, "dosage": string, "duration": string, "purpose": string }],
  "lifestyle": string[],
  "tests": string[],
  "redFlags": string[],
  "disclaimer": string
}
Keep prescriptions as common, safe, OTC-style suggestions when symptoms are mild. Always add a clear disclaimer that this is informational, not a substitute for a licensed physician.`;

    const userContent: any[] = [];
    if (reportText) userContent.push({ type: "text", text: `Report:\n${reportText}` });
    if (patientNote) userContent.push({ type: "text", text: `Patient note: ${patientNote}` });
    if (imageBase64) {
      userContent.push({
        type: "image_url",
        image_url: { url: `data:${mimeType || "image/png"};base64,${imageBase64}` },
      });
    }

    // Determine target API and model based on configured keys
    let apiUrl = "https://api.openai.com/v1/chat/completions";
    let modelName = "gpt-4o-mini";

    if (Deno.env.get("GEMINI_API_KEY")) {
      apiUrl = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
      modelName = "gemini-2.5-flash";
    }

    const aiRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI error", detail: txt }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    let parsed: any;
    try { parsed = JSON.parse(raw); } catch { parsed = { summary: raw, findings: [], possibleConditions: [], prescription: [], lifestyle: [], tests: [], redFlags: [], disclaimer: "Informational only — consult a physician." }; }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
