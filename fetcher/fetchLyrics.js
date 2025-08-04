import { DOMParser, Element } from "jsr:@b-fuze/deno-dom";

const requiredFields = ["title", "artist", "lyricist", "composer", "opening", "contains"];

const sitesData = {
  utaten: {
    name: "UtaTen",
    url: "https://utaten.com",
    /**
     * fetch lyrics from utaten
     * if there is only one result, fetch the full lyrics
     * @param {Object} info - song information (in general format)
     * @returns {Promise<Array>} - array of song results
     */
    fetchLyrics: async (info) => {
      // Implementation for fetching lyrics from UtaTen
      
      let link = (
        `https://utaten.com/search?
        sort=popular_sort_asc
        &artist_name=${encodeURI(info.artist)}
        &title=${encodeURI(info.title)}
        &beginning=${encodeURI(info.opening)}
        &body=${encodeURI(info.contains)}
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
      
      // get table of search results
      const searchResultElement = doc.querySelector(".searchResult tbody");
      
      // if there are no results, return an empty array
      if (!searchResultElement) {
        return [];
      }
      
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
        const songLink = `https://utaten.com${linkElement.getAttribute("href")}`;
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

      if (songResults.length !== 1) return songResults;
      
      // if there is only one result, fetch the full lyrics
      const song = songResults[0];
      
      const fullLyricsResponse = await fetch(song.link);
      const fullLyricsHtml = await fullLyricsResponse.text();
      
      const fullLyricsDoc = new DOMParser().parseFromString(fullLyricsHtml, "text/html");
      
      // get lyrics element
      // note: utaten supports both romaji and hiragana ruby text, but i want the hiragana
      const lyricsElement = fullLyricsDoc.getElementsByClassName("hiragana")[0];
      
      // if it was not successful, return an empty array
      if (!lyricsElement) {
        return [];
      }
      
      // get lyrics html collection
      // note: user child nodes instead of children because text nodes are also included
      const lyricsCollection = lyricsElement.childNodes;
      
      let rubyLyrics = ""; // html string to include ruby text
      let lyrics = ""; // plain text without ruby text
      
      for (const node of lyricsCollection) {
        // note: use nodeName rather than tagName because it works with text nodes
        const nodeName = node.nodeName;
        
        if (nodeName === "#text") {
          // if it's a text node, just append the text
          lyrics += node.textContent.trim();
          rubyLyrics += node.textContent.trim();
        } else if (nodeName === "BR") {
          rubyLyrics += "<br>";
          lyrics += "\n";
        } else if (nodeName === "SPAN") {
          // ruby text is a span
          // utaten does not use rt tag
          
          const rubyBottom = node.getElementsByClassName("rb")[0];
          const rubyTop = node.getElementsByClassName("rt")[0];
          
          const rubyBottomText = rubyBottom.textContent.trim();
          const rubyTopText = rubyTop.textContent.trim();
          
          // append the ruby text
          rubyLyrics += `<ruby>${rubyBottomText}<rt>${rubyTopText}</rt></ruby>`;
          lyrics += rubyBottomText;
        }
      }
      
      // add the full lyrics to the song object
      song.lyrics = lyrics;
      song.rubyLyrics = rubyLyrics;
      
      return songResults; // [song];
    }
  },
  utanet: {
    name: "UtaNet",
    url: "https://www.uta-net.com",
    /**
     * fetch lyrics from utanet
     * @param {Object} info - song information (in general format)
     * @returns {Promise<Array>} - array of song results
     */
    async fetchLyrics(info) {
      const results = [];
      
      // todo: add support for other fields which uses previous system which can be accessed by clicking the lyrics search option
      
      // utanet only supports search by a single field
      const availableFields = [
        "title",
      ];
      
      const fieldURL = {
        "title": "https://www.uta-net.com/search/?sort=4&Keyword=",
      };
      
      // construct array with available fields
      const searchFields = availableFields.filter(field => info[field]);
      
      for (const field of searchFields) {
        const value = info[field];
        // implement the fetch logic for utanet
      }
      
      return results;
    }
  }
}

const siteNames = Object.keys(sitesData);

/**
 * fetch lyrics from all sites
 * @param {Object} info - song information (in general format)
 * @returns {Promise<Array>} - array of song results from all sites
 */
async function fetchLyrics(info) {
  const results = [];

  // fill in missing fields with empty strings
  // consider replacing with null
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
            site: siteName, // this is an api so don't use site.name
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

export { fetchLyrics, siteNames, sitesData, requiredFields };