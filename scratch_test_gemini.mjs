import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testGemini() {
    const keys = (process.env.GEMINI_API_KEY || "").split(",").map(k => k.trim()).filter(k => k);
    console.log(`Found ${keys.length} Gemini keys.`);

    for (const [i, apiKey] of keys.entries()) {
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Respond with 'Key OK'" }] }]
                }),
            });

            const data = await response.json();
            if (response.status === 200) {
                console.log(`Key ${i + 1} (ending ...${apiKey.slice(-4)}): ✅ WORKING`);
            } else {
                console.log(`Key ${i + 1} (ending ...${apiKey.slice(-4)}): ❌ FAILED (${response.status})`);
                console.log(JSON.stringify(data.error || data, null, 2));
            }
        } catch (e) {
            console.log(`Key ${i + 1}: ❌ NETWORK ERROR - ${e.message}`);
        }
    }
}

testGemini();
