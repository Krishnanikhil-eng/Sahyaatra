const API_KEY = "AIzaSyDV7iZiVvcHDSacuOz4SlPxy637-8ia9qY";
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

async function testGemini() {
    console.log("Testing Gemini API...");
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hello, answer with 'Works!'" }] }]
            }),
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
}

testGemini();
