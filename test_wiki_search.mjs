async function testWikiSearch(query) {
  console.log(`\nTesting Wiki Search: ${query}`);
  try {
    const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=pageimages&format=json&pithumbsize=800`);
    const data = await res.json();
    if (!data.query || !data.query.pages) {
      console.log("No results.");
      return;
    }
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    console.log(`Found page: ${pages[pageId].title}`);
    if (pages[pageId].thumbnail) {
      console.log(`Image URL: ${pages[pageId].thumbnail.source}`);
    } else {
      console.log("No image on this page.");
    }
  } catch (e) {
    console.error(e);
  }
}

async function main() {
  await testWikiSearch("Konda Reddy Fort Andhra Pradesh");
  await testWikiSearch("Araku Valley");
  await testWikiSearch("Gandikota");
}

main();
