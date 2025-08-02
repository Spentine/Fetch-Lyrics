const sitesData = {
  utaten: {
    name: "UtaTen",
    url: "https://utaten.com",
    fetchLyrics: async (info) => {
      // Implementation for fetching lyrics from UtaTen
      
      let link = (
        `https://utaten.com/search?
        sort=popular_sort_asc
        &artist_name=${encodeURI(info.artist)}
        &title=${encodeURI(info.title)}
        &beginning=${encodeURI(info.opening)}
        &body=${encodeURI(info.body)}
        &lyricist=${encodeURI(info.lyricist)}
        &composer=${encodeURI(info.composer)}
        &sub_title=
        &tag=
        &show_artists=1`
      );
      
      // remove whitespace
      link = link.replace(/\s+/g, ""); 
      
      console.log(link);
      
      return [
        {
          lyrics: "insert lyrics here",
        },
      ];
    }
  }
}

const siteNames = Object.keys(sitesData);

async function fetchLyrics(info) {
  const results = [];
  const requiredFields = ["title", "artist", "lyricist", "composer", "opening", "body"];
  
  for (const field of requiredFields) {
    if (!info[field]) {
      info[field] = "";
    }
  }
  
  for (const siteName of siteNames) {
    const site = sitesData[siteName];
    try {
      const songCandidates = await site.fetchLyrics(info);
      if (songCandidates) {
        for (const song of songCandidates) {
          results.push({
            site: site.name,
            url: site.url,
            lyrics: song.lyrics,
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching lyrics from ${site.name}:`, error);
    }
  }
  
  return results;
}

export { fetchLyrics, siteNames, sitesData };