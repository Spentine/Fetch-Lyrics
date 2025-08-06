import { DOMParser, Element } from "jsr:@b-fuze/deno-dom";
import { checkSongCache, addSongCache, convertQueryToString, checkLyricsCache, addLyricsCache } from "./cache.js";

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
    fetchSongs: async (info) => {
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
          url: songLink,
          title: songTitle,
          artists: artists,
          beginning: beginning,
        };
        
        songResults.push(song);
      }
      
      return songResults;
      
      // if (songResults.length !== 1) return songResults;
      
      // // if there is only one result, fetch the full lyrics
      // const song = songResults[0];
      
      // // get the song link
      // const songLink = song.link;
      // const { lyrics, rubyLyrics } = await sitesData.utaten.singlePageLyrics(songLink);
      
      // // add the full lyrics to the song object
      // song.lyrics = lyrics;
      // song.rubyLyrics = rubyLyrics;
      
      // return songResults; // [song];
    },
    fetchLyrics: async (link) => {
      const fullLyricsResponse = await fetch(link);
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
      
      // return the lyrics and ruby lyrics
      return {
        lyrics: lyrics.trim(),
        rubyLyrics: rubyLyrics.trim(),
      };
    },
  },
  utanet: {
    name: "UtaNet",
    url: "https://www.uta-net.com",
    /**
     * fetch lyrics from utanet
     * @param {Object} info - song information (in general format)
     * @returns {Promise<Array>} - array of song results
     */
    async fetchSongs(info) {
      const results = [];
      
      // utanet only supports search by a single field
      const availableFields = [
        "title", "artist", "lyricist", "composer", "contains",
      ];
      
      const fieldURL = {
        "title": "https://www.uta-net.com/user/index_search/search2.html?st=Popular1&ct=10&rc=10&md=Title&kw=",
        "artist": "https://www.uta-net.com/user/index_search/search2.html?st=Popular1&ct=10&rc=10&md=Artist&kw=",
        "lyricist": "https://www.uta-net.com/user/index_search/search2.html?st=Popular1&ct=10&rc=10&md=Sakushisha&kw=",
        "composer": "https://www.uta-net.com/user/index_search/search2.html?st=Popular1&ct=10&rc=10&md=Sakkyokusha&kw=",
        "contains": "https://www.uta-net.com/user/index_search/search2.html?st=Popular1&ct=10&rc=10&md=Kashi&kw=",
      };
      
      // construct array with available fields
      const searchFields = availableFields.filter(field => info[field] !== "");
      
      for (const field of searchFields) {
        const value = info[field];
        // implement the fetch logic for utanet
        
        const fullURL = fieldURL[field] + encodeURIComponent(value);
        const response = await fetch(fullURL);
        const html = await response.text();
        
        const doc = new DOMParser().parseFromString(html, "text/html");
        
        // get table of search results
        const searchList = doc.getElementById("search_list");
        const childrenRows = searchList.children;
        
        // rows are in pairs of two; title and lyrics
        for (let i = 0; i < childrenRows.length; i += 2) {
          const titleRow = childrenRows[i];
          const lyricsRow = childrenRows[i + 1];
          
          // how convenient that it's just the children
          // no need to do any complex parsing
          const title = titleRow.children[0].textContent.trim();
          const artist = titleRow.children[1].textContent.trim();
          const lyricist = titleRow.children[2].textContent.trim();
          const composer = titleRow.children[3].textContent.trim();
          
          const link = titleRow.children[0].children[0].getAttribute("href");
          
          let lyrics = lyricsRow.textContent.trim();
          
          // // remove "..." at the beginning
          // if (lyrics.startsWith("...")) {
          //   lyrics = lyrics.slice(3);
          // }

          // // remove "..." at the end
          // if (lyrics.endsWith("...")) {
          //   lyrics = lyrics.slice(0, -3);
          // }
          
          const song = {
            title: title,
            url: `https://www.uta-net.com${link}`,
            artists: [
              { type: "artist", artists: [artist] },
              { type: "lyricist", artists: [lyricist] },
              { type: "composer", artists: [composer] },
            ],
            lyricsSample: lyrics,
          };
          
          results.push(song);
        }
      }
      
      // filter out duplicates
      const uniqueResults = new Map();
      for (let i=0; i < results.length; i++) {
        const result = results[i];
        const url = result.url;
        if (!uniqueResults.has(url)) {
          uniqueResults.set(url, result);
        } else {
          // remove duplicate
          results.splice(i, 1);
          i--; // adjust index after removal
        }
      }
      
      // filter array for songs that don't match the required fields
      const filteredResults = results.filter(song => {
        const songArtists = song.artists;
        for (const field of searchFields) {
          // handle irregular fields
          if (field === "title") {
            if (!song.title.includes(info.title)) return false;
            continue;
          }
          if (field === "contains") {
            if (!song.lyricsSample.includes(info.contains)) return false;
            continue;
          }
          
          // handle artists
          const fieldArtist = songArtists.find(artist => artist.type === field).artists[0];
          if (!fieldArtist || !fieldArtist.includes(info[field])) return false;
        }
        return true;
      });
      
      return filteredResults;

      // if (filteredResults.length !== 1) return filteredResults;
      
      // // if there is only one result, fetch the full lyrics
      // const song = filteredResults[0];
      // const url = song.url;
      // const { lyrics } = await sitesData.utanet.singlePageLyrics(url);
      
      // // add the full lyrics to the song object
      // song.lyrics = lyrics;
      
      // return filteredResults; // [song];
    },
    fetchLyrics: async (link) => {
      const fullLyricsResponse = await fetch(link);
      const fullLyricsHtml = await fullLyricsResponse.text();
      
      const fullLyricsDoc = new DOMParser().parseFromString(fullLyricsHtml, "text/html");
      
      // get lyrics element
      const lyricsElement = fullLyricsDoc.getElementById("kashi_area");
      
      const lyricsCollection = lyricsElement.childNodes;
      
      let lyrics = "";
      for (const node of lyricsCollection) {
        const nodeName = node.nodeName;
        
        if (nodeName === "#text") {
          lyrics += node.textContent.trim();
        } else if (nodeName === "BR") {
          lyrics += "\n";
        }
      }
      
      // return the lyrics
      return {
        lyrics: lyrics,
      };
    },
  },
  imicom: {
    name: "Imitate Community",
    url: "https://lyrics.imicomweb.com",
    fetchSongs: async (info) => {
      const baseURL = "https://lyrics.imicomweb.com/api/html/song_cards";
      
      // construct the query parameters
      const baseQuery = {
        isjoke: "false",
        sort: "-view", // descending by view count
        page: 1,
      };
      const queryMap = {
        "title": "title",
        "artist": "channel",
        "contains": "lyrics",
      }
      for (const queryField of Object.keys(queryMap)) {
        if (info[queryField]) {
          baseQuery[queryMap[queryField]] = info[queryField];
        }
      }
      const queryString = new URLSearchParams(baseQuery).toString();
      
      // construct the full URL
      const fullURL = `${baseURL}?${queryString}`;
      
      const response = await fetch(fullURL);
      const data = await response.json();
      
      const results = [];
      
      // it's a weird json thing where each item is html
      for (const item of data) {
        // for some reason songs start with two newlines before getting to the actual content
        // however with the loading animation and text at the top it doesn't do that
        if (!item.startsWith("\n\n")) continue;
        
        // parse the html
        const doc = new DOMParser().parseFromString(item, "text/html");
        
        const songCard = doc.querySelector(".song-card");
        const link = songCard.getAttribute("href");
        
        const rows = songCard.getElementsByTagName("tr");
        const title = rows[0].children[0].lastChild.textContent;
        
        const artist = rows[1].children[0].lastChild.textContent;
        const artists = [];
        if (artist !== "合作") { // japanese for "collaboration"
          artists.push({
            type: "artist",
            artists: [artist],
          });
        }
        
        let beginning = rows[1].children[2].lastChild.textContent;
        if (beginning === "インスト曲") { // japanese for "instrumental"
          beginning = null;
        }
        
        const song = {
          title: title,
          url: `https://lyrics.imicomweb.com${link}`,
          artists: artists,
        };
        
        if (beginning) song.beginning = beginning;
        
        // add the song to the results
        results.push(song);
      }
      return results;
    },
    fetchLyrics: async (info) => {
      
    },
  }
}

const siteNames = Object.keys(sitesData);

/**
 * fetch songs from all sites
 * @param {Object} info - song information (in general format)
 * @returns {Promise<Array>} - array of song results from all sites
 */
async function fetchSongs(info) {
  // fill in missing fields with empty strings
  // consider replacing with null
  for (const field of requiredFields) {
    if (!info[field]) {
      info[field] = "";
    }
  } 
  
  // make sure at least one field is filled
  const isEmpty = requiredFields.every(field => info[field] === "");
  if (isEmpty) return []; // return empty array if no fields are filled
  
  // check cache first
  const queryString = convertQueryToString(info);
  const cachedResult = checkSongCache(queryString);
  if (cachedResult) {
    console.log("Cache hit for query:", queryString);
    return cachedResult;
  }

  console.log("Fetching lyrics with info:", info);
  
  const results = [];
  
  for (const siteName of siteNames) {
    const site = sitesData[siteName];
    try {
      const songCandidates = await site.fetchSongs(info);
      if (songCandidates) {
        for (const song of songCandidates) {
          results.push({
            site: siteName, // this is an api so don't use site.name
            siteName: site.name,
            url: site.url,
            songInfo: song,
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching lyrics from ${site.name}:`, error);
    }
  }
  
  console.log("Fetched lyrics from all sites:", results);
  
  // cache the results
  addSongCache(queryString, results);
  
  return results;
}

async function fetchLyrics(link) {
  // check cache first
  const cachedLyrics = checkLyricsCache(link);
  if (cachedLyrics) {
    console.log("Cache hit for lyrics link:", link);
    return cachedLyrics;
  }
  
  // find which site the link belongs to
  const siteName = siteNames.find(name => link.includes(sitesData[name].url));
  if (!siteName) return null; // site not found
  const site = sitesData[siteName];
  
  try {
    const lyricsInfo = await site.fetchLyrics(link);

    const siteInformation = {
      site: siteName,
      siteName: site.name,
      url: site.url,
    };
    
    // merge site information with lyrics info
    const full = {
      ...siteInformation, ...lyricsInfo,
    };
    
    // cache the lyrics
    addLyricsCache(link, full);
    
    console.log("Fetched lyrics from site:", site.name);
    console.log("Lyrics info:", full);
    
    return full;
  } catch (error) {
    console.error(`Error fetching lyrics from ${site.name}:`, error);
    return null;
  }
}

export { fetchSongs, siteNames, sitesData, requiredFields, fetchLyrics };