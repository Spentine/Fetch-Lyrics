const sitesData = {
  utaten: {
    name: "UtaTen",
    url: "https://utaten.com",
    fetchLyrics: async (info) => {
      // Implementation for fetching lyrics from UtaTen
      return {
        lyrics: "insert lyrics here",
      }
    }
  }
}

const siteNames = Object.keys(sitesData);

async function fetchLyrics(info) {
  const results = [];
  
  for (const siteName of siteNames) {
    const site = sitesData[siteName];
    try {
      const songCandidates = await site.fetchLyrics(info);
      if (songCandidates) {
        results.push({
          site: site.name,
          url: site.url,
          lyrics: songCandidates.lyrics,
        });
      }
    } catch (error) {
      console.error(`Error fetching lyrics from ${site.name}:`, error);
    }
  }
  
  return results;
}

export { fetchLyrics, siteNames, sitesData };