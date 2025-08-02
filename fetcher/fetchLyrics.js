import { DOMParser, Element } from "jsr:@b-fuze/deno-dom";

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
      
      // fetch lyrics from the link
      const response = await fetch(link);
      const html = await response.text();
      
      const doc = new DOMParser().parseFromString(html, "text/html");
      
      // html table with results
      const searchResultElement = (
        doc.getElementsByClassName("searchResult")[0]
          .getElementsByTagName("tbody")[0]
      );
      
      const resultElements = [];
      
      // start at 1 to skip the header row
      for (let i = 1; i < searchResultElement.children.length; i++) {
        resultElements.push(
          searchResultElement.children[i]
        );
      }
      
      const songResults = [];
      
      for (const resultElement of resultElements) {
        const columns = resultElement.children;
        
        const linkElement = columns[0].getElementsByTagName("a")[0];
        const songLink = linkElement.getAttribute("href");
        const songTitle = linkElement.textContent.trim();
        
        const artistElements = columns[1].getElementsByTagName("p");
        const artists = [];
        // first artist is a general artist and doesn't follow the same format
        for (let i = 1; i < artistElements.length; i++) {
          const element = artistElements[i];
          const type = element.firstChild;
          const typeMap = {
            "作詞": "lyricist",
            "作曲": "composer",
            "編曲": "arranger",
          };
          // get the type by checking if the string includes the type
          const typeKey = Object.keys(typeMap).find(key => type.textContent.includes(key));
          
          // if it doesn't match any type, idk the category so it will be ignored
          if (!typeKey) continue;
          
          const artistSameType = [];
          const artistNames = element.children[0].children;
          
          for (const artistName of artistNames) {
            artistSameType.push(artistName.textContent.trim());
          }
          
          artists.push({
            artists: artistSameType,
            type: typeMap[typeKey],
          });
        }
        
        const lyricElement = columns[2].getElementsByTagName("a")[0];
        const beginning = lyricElement.textContent.trim();
        
        const song = {
          link: songLink,
          title: songTitle,
          artists: artists,
          beginning: beginning,
        };
        
        songResults.push(song);
      }

      return songResults;
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
            songInfo: song,
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