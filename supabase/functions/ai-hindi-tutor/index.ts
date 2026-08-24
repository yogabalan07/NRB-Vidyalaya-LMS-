import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message, level, topic, conversationHistory } = await req.json();

    // TODO: Integrate with OpenAI API
    // This is a placeholder for the AI Hindi Tutor

    const systemPrompt = `You are a friendly Hindi language tutor for NRB Vidyalaya.
Level: ${level || "beginner"}
Topic: ${topic || "General conversation"}
Respond in Hindi with English explanations when requested.
Correct grammar mistakes and encourage the student.`;

    return new Response(
      JSON.stringify({
        status: "success",
        data: {
          reply: "नमस्ते! मैं आपका हिंदी शिक्षक हूँ। आप कैसे हैं? (Hello! I am your Hindi teacher. How are you?)",
          correction: null,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ status: "error", message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
