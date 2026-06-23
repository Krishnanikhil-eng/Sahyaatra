async function testWikipedia(query) {
  console.log(`\nTesting Query: ${query}`);
  try {
    const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(query)}&format=json&pithumbsize=800`);
    const data = await res.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId === "-1") {
      console.log("No wikipedia page found.");
    } else {
      console.log(`Found page: ${pages[pageId].title}`);
      if (pages[pageId].thumbnail) {
        console.log(`Image URL: ${pages[pageId].thumbnail.source}`);
      } else {
        console.log("No image on this page.");
      }
    }
  } catch (e) {
    console.error(e);
  }
}

async function main() {
  await testWikipedia("Konda Reddy Fort");
  await testWikipedia("Borra Caves");
  await testWikipedia("Belum Caves");
  await testWikipedia("Gooty Fort");
  await testWikipedia("Kanaka Durga Temple");
}

main();
