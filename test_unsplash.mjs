const UNSPLASH_ACCESS_KEY = "PDa7fpLGuSdOUmpVJyh6GSyYwdyeImsKsBmP8GgcXBg";
const UNSPLASH_API_URL = "https://api.unsplash.com";

async function testSearch(query) {
  console.log(`\nTesting Query: ${query}`);
  try {
    const res = await fetch(
      `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`,
      { headers: { 'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
    );
    if (!res.ok) {
      console.log("Fetch failed", res.status);
      return;
    }
    const data = await res.json();
    console.log(`Found ${data.results.length} results.`);
    data.results.forEach((photo, i) => {
      console.log(`\nResult ${i + 1}:`);
      console.log(`ID: ${photo.id}`);
      console.log(`Alt Description: ${photo.alt_description}`);
      console.log(`Description: ${photo.description}`);
      if (photo.location) console.log(`Location: ${JSON.stringify(photo.location)}`);
      if (photo.tags) console.log(`Tags: ${photo.tags.map(t => t.title).join(', ')}`);
    });
  } catch (e) {
    console.error(e);
  }
}

async function main() {
  await testSearch("Konda Reddy Fort");
  await testSearch("Borra Caves");
  await testSearch("Konda Reddy Fort Andhra Pradesh India");
  await testSearch("Borra Caves Andhra Pradesh India");
}

main();
