const PEXELS_API_KEY = "9WIvfcdWPVL1MG9JS8J45MW1IVfSx8cZ8BMjk8ghvs8aezKZHmuXhxkC";
const PEXELS_API_URL = "https://api.pexels.com/v1";

async function testSearch(query) {
  console.log(`\nTesting Query: ${query}`);
  try {
    const pexelsRes = await fetch(
      `${PEXELS_API_URL}/search?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`,
      { headers: { 'Authorization': PEXELS_API_KEY } }
    );
    if (!pexelsRes.ok) {
      console.log("Fetch failed", pexelsRes.status);
      return;
    }
    const data = await pexelsRes.json();
    console.log(`Found ${data.photos.length} results.`);
    data.photos.forEach((photo, i) => {
      console.log(`\nResult ${i + 1}:`);
      console.log(`Alt: ${photo.alt}`);
      console.log(`Photographer: ${photo.photographer}`);
      console.log(`URL: ${photo.url}`);
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
