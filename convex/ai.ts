import { action } from "./_generated/server";
import { v } from "convex/values";

// Gemini API configuration - support for multiple keys
const GEMINI_API_KEYS = (process.env.GEMINI_API_KEY || "")
  .split(",")
  .map(k => k.trim())
  .filter(k => k.length > 0);

// Track rate-limited keys: key -> timestamp when it becomes available again
const rateLimitedKeys = new Map<string, number>();

// Unsplash API configuration
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY!;
const UNSPLASH_API_URL = "https://api.unsplash.com";

/**
 * Helper: Call Gemini API with automatic key rotation
 * Tries each available key until one succeeds or all are rate-limited
 */
async function callGeminiWithKeyRotation(payload: any): Promise<Response | null> {
  const now = Date.now();

  // Try each API key in sequence
  for (const apiKey of GEMINI_API_KEYS) {
    // Check if this key is rate-limited
    const limitedUntil = rateLimitedKeys.get(apiKey);
    if (limitedUntil && now < limitedUntil) {
      console.log(`Skipping rate-limited key ending in ...${apiKey.slice(-8)}`);
      continue;
    }

    // If cooldown expired, remove from rate-limited map
    if (limitedUntil && now >= limitedUntil) {
      rateLimitedKeys.delete(apiKey);
    }

    console.log(`Trying API key ending in ...${apiKey.slice(-8)}`);

    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // If rate limited or service unavailable, try next key
      if (response.status === 429 || response.status >= 500) {
        console.log(`Key ...${apiKey.slice(-8)} encountered status ${response.status}, trying next key`);
        if (response.status === 429) {
          rateLimitedKeys.set(apiKey, now + 60000); // Block for 1 minute locally
        }
        continue;
      }

      // If it's explicitly NOT ok (e.g. 400, 403), we should probably still try the next key
      // just in case it's a key-specific suspension or quota issue disguised as something else
      if (!response.ok) {
        console.error(`Received error ${response.status} from key ...${apiKey.slice(-8)}. Rotating...`);
        continue;
      }

      // Success! Return the response
      console.log(`Successfully called API with key ...${apiKey.slice(-8)}`);
      return response;

    } catch (error) {
      console.error(`Error with key ...${apiKey.slice(-8)}:`, error);
      continue;
    }
  }

  // All keys failed or are rate-limited
  console.error("All API keys are rate-limited or failed");
  return null;
}


/**
 * Helper: safely extract the text content from Gemini response
 * and log useful debugging info without exposing API keys.
 */
async function extractAICandidateText(response: Response) {
  let data: any;
  try {
    data = await response.json();
  } catch (err) {
    console.error("Failed to parse JSON from Gemini response:", err);
    return { text: null, raw: null, dataErr: err };
  }

  // If API returned an explicit error object (common with invalid key / quota / model)
  if (data?.error) {
    console.error("Gemini API returned an error object:", {
      message: data.error.message || data.error,
      code: data.error.code || "N/A",
      // Do not log full error object with keys -- keep it minimal
    });
    return { text: null, raw: data, dataErr: data.error };
  }

  // Try to find the candidate text safely
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    // Data did not include expected candidates — log the shape for debugging
    console.error("Gemini response missing expected 'candidates' text. Response shape:", {
      hasCandidates: !!data?.candidates,
      candidatesCount: Array.isArray(data?.candidates) ? data.candidates.length : 0,
      sampleKeys: Object.keys(data || {}).slice(0, 10),
    });
    return { text: null, raw: data, dataErr: new Error("Missing candidates or text") };
  }

  return { text: content, raw: data, dataErr: null };
}

/**
 * Helper: clean AI returned text to try extract JSON blob and attempt to fix incomplete JSON
 */
function cleanAndExtractJson(text: string) {
  // 1. Remove markdown code blocks (start and end)
  let clean = text.replace(/```json/gi, "").replace(/```/g, "");

  // 2. Find the first '{' and the last '}'
  const firstOpen = clean.indexOf("{");
  const lastClose = clean.lastIndexOf("}");

  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    clean = clean.substring(firstOpen, lastClose + 1);
  }

  // 3. Remove trailing commas (common AI JSON error)
  clean = clean.replace(/,(\s*[}\]])/g, '$1');

  // 4. Attempt to fix incomplete JSON by closing unclosed structures
  // Count open vs closed braces and brackets
  let openBraces = (clean.match(/{/g) || []).length;
  let closeBraces = (clean.match(/}/g) || []).length;
  let openBrackets = (clean.match(/\[/g) || []).length;
  let closeBrackets = (clean.match(/\]/g) || []).length;

  // If there are unclosed structures, try to close them
  if (openBraces > closeBraces || openBrackets > closeBrackets) {
    console.log("Attempting to fix incomplete JSON - unclosed structures detected");

    // Remove any trailing incomplete key-value pairs (e.g., "key": incomplete_value)
    clean = clean.replace(/,?\s*"[^"]*"\s*:\s*[^,}\]]*$/, '');

    // Close arrays first, then objects
    for (let i = 0; i < (openBrackets - closeBrackets); i++) {
      clean += ']';
    }
    for (let i = 0; i < (openBraces - closeBraces); i++) {
      clean += '}';
    }

    console.log("Fixed JSON by adding missing closing brackets/braces");
  }

  return clean.trim();
}

/**
 * Rate limit specific fallback
 */
function rateLimitItinerary(args: any) {
  return {
    error: "RATE_LIMIT",
    days: [
      {
        day: 1,
        title: "AI Service Temporarily Busy",
        activities: [
          "The AI service has reached its rate limit.",
          "Please wait a few seconds and try again.",
        ],
        estimatedCost: 0,
        tips: "This is a temporary issue. Your request will work after a short wait.",
      },
    ],
    totalEstimatedCost: args.budget || 0,
    generalTips: [
      "AI service is temporarily busy. Please wait a few seconds and try again.",
      "Rate limits reset automatically after a short period.",
    ],
  };
}

/**
 * Safe fallback itinerary returned when AI fails
 */
function fallbackItinerary(args: any) {
  return {
    days: [
      {
        day: 1,
        title: "AI unavailable — fallback itinerary",
        activities: [
          "AI response not available. Please try again or check logs for details.",
        ],
        estimatedCost: Math.floor(args.budget / 3 || 0),
        tips: "AI response unavailable — try again later or refine your inputs.",
      },
    ],
    totalEstimatedCost: args.budget || 0,
    generalTips: [
      "AI response unavailable. Please try again later.",
      "Ensure server environment variables (GEMINI_API_KEY) are configured.",
    ],
  };
}

export const generateItinerary = action({
  args: {
    destination: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    budget: v.number(),
    travelers: v.number(),
    interests: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if we have any API keys configured
    if (GEMINI_API_KEYS.length === 0) {
      console.error("No GEMINI_API_KEY environment variables configured. Cannot call Gemini API.");
      return fallbackItinerary(args);
    }

    const prompt = `Create a detailed travel itinerary for ${args.destination} from ${args.startDate} to ${args.endDate}.

    Requirements:
    - Budget: ₹${args.budget} for ${args.travelers} travelers
    - Interests: ${args.interests.join(", ")}
    - Provide day-by-day activities with realistic costs
    - Include practical tips and recommendations
    - Focus on Indian destinations and local experiences

    IMPORTANT: Respond ONLY with valid, raw JSON. Do NOT use markdown formatting (no markdown code blocks). Do NOT include any text outside the JSON object.

  Expected JSON Format:
    {
      "days": [
        {
          "day": 1,
          "title": "Arrival and City Exploration",
          "activities": [
            "Arrive at airport and check into hotel",
            "Visit local landmark",
            "Try local cuisine"
          ],
          "estimatedCost": 5000,
          "tips": "Book airport transfer in advance"
        }
      ],
      "totalEstimatedCost": 15000,
      "generalTips": [
        "Carry cash for local markets",
        "Book accommodations in advance"
      ]
    }`;

    try {
      const response = await callGeminiWithKeyRotation({
        contents: [
          {
            parts: [
              {
                text: `You are a travel planning expert specializing in Indian destinations.Provide practical, budget - conscious itineraries with accurate cost estimates in Indian Rupees.\n\n${prompt} `,
              },
            ],
          },
        ],
        generationConfig: { temperature: 0.7, maxOutputTokens: 8000 },
      });

      // If all keys are exhausted, return rate limit response
      if (!response) {
        console.error("All API keys exhausted or rate-limited");
        return rateLimitItinerary(args);
      }

      console.log(response)

      // The rotation function already handled 429 errors, no need to check again
      const { text: content, raw, dataErr } = await extractAICandidateText(response);

      if (!content) {
        // Check if it was a rate limit error from the error object
        if (dataErr && (dataErr.code === 429 || dataErr.message?.includes('quota') || dataErr.message?.includes('rate limit'))) {
          console.error("Rate limit detected in error response.");
          return rateLimitItinerary(args);
        }
        // Log raw response for debugging (already logged in extract function), return fallback
        console.error("No content returned from Gemini. Returning fallback itinerary.");
        return fallbackItinerary(args);
      }

      try {
        let cleanContent = cleanAndExtractJson(content);

        // Enhanced logging to debug JSON parsing issues
        console.log("=== AI RESPONSE DEBUG ===");
        console.log("Raw content length:", content.length);
        console.log("Raw content (first 500 chars):", content.substring(0, 500));
        console.log("Cleaned content length:", cleanContent.length);
        console.log("Cleaned content:", cleanContent);
        console.log("========================");

        const itinerary = JSON.parse(cleanContent);

        if (itinerary.days && Array.isArray(itinerary.days)) {
          return {
            days: itinerary.days.map((day: any, index: number) => ({
              day: day.day || index + 1,
              title: day.title || `Day ${index + 1} `,
              activities: Array.isArray(day.activities)
                ? day.activities
                : [day.activities || "Activity details not available"],
              estimatedCost: day.estimatedCost || Math.floor(args.budget / (itinerary.days.length || 1)),
              tips: day.tips || "Enjoy your day!",
            })),
            totalEstimatedCost: itinerary.totalEstimatedCost || args.budget,
            generalTips: Array.isArray(itinerary.generalTips)
              ? itinerary.generalTips
              : [itinerary.generalTips || "Have a great trip!"],
          };
        }

        // If the returned object isn't in expected shape, return it (preserve behavior)
        return itinerary;
      } catch (parseError) {
        // Parsing failed - log raw content and return structured fallback with extracted activities
        console.error("=== JSON PARSING FAILED ===");
        console.error("Parse Error:", (parseError as Error).message);
        console.error("Raw content (full):", content);
        console.error("Cleaned content that failed to parse:", cleanAndExtractJson(content));
        console.error("===========================");

        const lines = (content || "").split("\n").filter((line: any) => line.trim());
        const activities = lines.slice(0, 5).map((line: string) => line.replace(/^\d+\.?\s*/, "").trim());

        return {
          days: [
            {
              day: 1,
              title: "AI Generated Itinerary",
              activities: activities.length > 0 ? activities : ["AI generated itinerary - please check the full response for details"],
              estimatedCost: Math.floor((args.budget || 0) / 3),
              tips: "AI response received but parsing failed. Please review the detailed itinerary above.",
            },
          ],
          totalEstimatedCost: args.budget || 0,
          generalTips: ["AI response received", "Please review the detailed itinerary", "Contact support if you need assistance"],
        };
      }
    } catch (error) {
      // Catch network or unexpected errors. Log and return fallback.
      console.error("AI generation error (network/unknown):", (error as Error).message || error);
      return fallbackItinerary(args);
    }
  },
});

export const chatWithAI = action({
  args: { message: v.string(), context: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (GEMINI_API_KEYS.length === 0) {
      console.error("No GEMINI_API_KEY configured. chatWithAI cannot call Gemini API.");
      return "AI service unavailable. Please try again later.";
    }

    const systemPrompt = `You are sahyaatra AI, a helpful travel assistant for India.You help users with:
  - Travel planning and recommendations
    - Budget advice for Indian destinations
      - Cultural insights and local tips
        - Safety and practical travel information
          - Connecting with travel companions

    Keep responses helpful, concise, and focused on Indian travel.If asked about booking or payments, explain that users should use the platform's trip posting feature to connect with travel buddies.

    ${args.context ? `Context: ${args.context}` : ""} `;

    try {
      const response = await callGeminiWithKeyRotation({
        contents: [{ parts: [{ text: `${systemPrompt} \n\nUser: ${args.message} ` }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
      });

      if (!response) {
        return "AI service is temporarily busy. Please try again in a moment.";
      }

      const { text: content } = await extractAICandidateText(response);
      if (!content) {
        return "I'm sorry, the AI did not return a response. Please try again later.";
      }
      return content;
    } catch (error) {
      console.error("AI chat error (network/unknown):", (error as Error).message || error);
      return "I'm experiencing some technical difficulties. Please try again later or use the platform's other features to plan your trip.";
    }
  },
});

export const getDestinationInfo = action({
  args: { destination: v.string() },
  handler: async (ctx, args) => {
    if (GEMINI_API_KEYS.length === 0) {
      console.error("No GEMINI_API_KEY configured. getDestinationInfo cannot call Gemini API.");
      return {
        bestTime: "October to March",
        attractions: ["Information temporarily unavailable"],
        budgetEstimate: { budget: 5000, midRange: 12000, luxury: 25000 },
        cuisine: ["Local specialties"],
        transportation: "Information currently unavailable",
      };
    }

    const prompt = `Provide key information about ${args.destination} as a travel destination in India.Include:
- Best time to visit
  - Top 5 attractions
    - Approximate budget for 3 days(budget, mid - range, luxury)
      - Local cuisine highlights
        - Transportation tips

Format as JSON:
{
  "bestTime": "Month range",
    "attractions": ["Attraction 1", "Attraction 2", ...],
      "budgetEstimate": {
    "budget": 5000,
      "midRange": 12000,
        "luxury": 25000
  },
  "cuisine": ["Dish 1", "Dish 2", ...],
    "transportation": "Transportation tips"
} `;

    try {
      const response = await callGeminiWithKeyRotation({
        contents: [{ parts: [{ text: `You are a travel expert specializing in Indian destinations.Provide accurate, practical information.\n\n${prompt} ` }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
      });

      if (!response) {
        console.error("All API keys exhausted for getDestinationInfo. Returning fallback values.");
        return {
          bestTime: "October to March",
          attractions: ["Information available on request"],
          budgetEstimate: { budget: 5000, midRange: 12000, luxury: 25000 },
          cuisine: ["Local specialties"],
          transportation: "Information temporarily unavailable",
        };
      }

      const { text: content } = await extractAICandidateText(response);
      if (!content) {
        console.error("No content from Gemini for getDestinationInfo. Returning fallback values.");
        return {
          bestTime: "October to March",
          attractions: ["Information available on request"],
          budgetEstimate: { budget: 5000, midRange: 12000, luxury: 25000 },
          cuisine: ["Local specialties"],
          transportation: "Information temporarily unavailable",
        };
      }

      try {
        const cleaned = cleanAndExtractJson(content);
        return JSON.parse(cleaned);
      } catch (parseError) {
        console.error("Parsing error in getDestinationInfo:", (parseError as Error).message);
        return {
          bestTime: "October to March",
          attractions: ["Information available on request"],
          budgetEstimate: { budget: 5000, midRange: 12000, luxury: 25000 },
          cuisine: ["Local specialties"],
          transportation: content.substring(0, 200),
        };
      }
    } catch (error) {
      console.error("Destination info error (network/unknown):", (error as Error).message || error);
      return {
        bestTime: "October to March",
        attractions: ["Information available on request"],
        budgetEstimate: { budget: 5000, midRange: 12000, luxury: 25000 },
        cuisine: ["Local specialties"],
        transportation: "Information temporarily unavailable",
      };
    }
  },
});

// Unsplash API functions (left unchanged; only improved error logging)
export const getPlaceImages = action({
  args: { placeName: v.string(), count: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const count = args.count || 5;
    try {
      const response = await fetch(
        `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(args.placeName + " India tourism")}&per_page=${count}&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
      );

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results.map((photo: any) => ({
          id: photo.id,
          url: photo.urls.regular,
          thumbUrl: photo.urls.thumb,
          alt: photo.alt_description || args.placeName,
          photographer: photo.user.name,
          photographerUrl: photo.user.links.html,
        }));
      }
      return [];
    } catch (error) {
      console.error("Unsplash API error:", (error as Error).message || error);
      return [];
    }
  },
});

export const getDestinationImages = action({
  args: { destination: v.string(), category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const query = args.category ? `${args.destination} ${args.category} India` : `${args.destination} tourism India`;
    try {
      const response = await fetch(
        `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=8&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
      );

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results.map((photo: any) => ({
          id: photo.id,
          url: photo.urls.regular,
          thumbUrl: photo.urls.thumb,
          alt: photo.alt_description || args.destination,
          photographer: photo.user.name,
          photographerUrl: photo.user.links.html,
        }));
      }
      return [];
    } catch (error) {
      console.error("Unsplash API error:", (error as Error).message || error);
      return [];
    }
  },
});

export const getRandomTravelImages = action({
  args: { count: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const count = args.count || 10;
    try {
      const response = await fetch(
        `${UNSPLASH_API_URL}/search/photos?query=India travel tourism&per_page=${count}&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
      );

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results.map((photo: any) => ({
          id: photo.id,
          url: photo.urls.regular,
          thumbUrl: photo.urls.thumb,
          alt: photo.alt_description || "India travel",
          photographer: photo.user.name,
          photographerUrl: photo.user.links.html,
        }));
      }
      return [];
    } catch (error) {
      console.error("Unsplash API error:", (error as Error).message || error);
      return [];
    }
  },
});
