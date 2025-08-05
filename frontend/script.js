async function fetchSongs(info) {
  const api = "http://localhost:8400/api/fetchSongs";
  
  // use this once it's in prod
  // const api = "https://spentine.com/api/fetchSongs";
  
  const params = new URLSearchParams(info);
  const url = `${api}?${params.toString()}`;
  console.log("Fetching lyrics from:", url);

  const response = await fetch(url);
  const data = await response.json();

  return data;
}

async function fetchLyrics(link) {
  const api = "http://localhost:8400/api/fetchLyrics";
  
  // use this once it's in prod
  // const api = "https://spentine.com/api/fetchLyrics";
  
  const params = new URLSearchParams({ link });
  const url = `${api}?${params.toString()}`;
  console.log("Fetching lyrics from:", url);

  const response = await fetch(url);
  const data = await response.json();

  return data;
}

/**
 * (ai generated)
 * splits a title into two parts: the main title and the subtitle
 * @param {string} title - the full title of the song
 * @return {Object} - an object containing the main title and subtitle
 */
function splitTitle(title) {
  // the split will only be in the format: x(y)
  // no fucking regexes
  const openParenIndex = title.indexOf("(");
  const closeParenIndex = title.indexOf(")");

  if (openParenIndex === -1 || closeParenIndex === -1) {
    // no subtitle found
    return {
      main: title,
      subtitle: null
    };
  }

  const mainTitle = title.slice(0, openParenIndex).trim();
  const subtitle = title.slice(openParenIndex + 1, closeParenIndex).trim();

  return {
    main: mainTitle,
    subtitle: subtitle
  };
}

function main() {
  // query menu
  const titleInput = document.getElementById("titleInput");
  const artistInput = document.getElementById("artistInput");
  const lyricistInput = document.getElementById("lyricistInput");
  const composerInput = document.getElementById("composerInput");
  const openingInput = document.getElementById("openingInput");
  const containsInput = document.getElementById("containsInput");
  
  // search button
  const searchButton = document.getElementById("searchButton");
  
  // songs container
  const songsContainer = document.getElementById("songsContainer");
  
  // lyrics container
  const lyricsContainer = document.getElementById("lyricsContainer");
  
  // get lyrics button
  const getLyricsButton = document.getElementById("getLyricsButton");
  
  // link input for lyrics
  const linkInput = document.getElementById("linkInput");
  
  searchButton.addEventListener("click", async () => {
    const info = {
      title: titleInput.value,
      artist: artistInput.value,
      lyricist: lyricistInput.value,
      composer: composerInput.value,
      opening: openingInput.value,
      contains: containsInput.value,
    };
    
    // fetch songs
    const results = await fetchSongs(info);
    
    // display results
    console.log("Fetched Lyrics Results:", results);
    
    displayResults(results);
  });
  
  function setLinkInput(link) {
    linkInput.value = link;
  }
  
  function displayResults(results) {
    // clear previous results
    while (songsContainer.firstChild) {
      songsContainer.removeChild(songsContainer.firstChild);
    }
    
    // check if results are empty
    if (results.length === 0) {
      const noResultsMessage = document.createElement("p");
      noResultsMessage.textContent = "No songs found.";
      songsContainer.appendChild(noResultsMessage);
      return;
    }
    
    // create result elements
    for (const result of results) {
      const songInfo = result.songInfo;
      
      const resultElement = document.createElement("div");
      resultElement.className = "song-item";
      
      // split title into main and subtitle
      const { main: mainTitle, subtitle } = splitTitle(songInfo.title);
      
      const titleElement = document.createElement("h3");
      titleElement.className = "title";
      titleElement.textContent = mainTitle ?? "<No Title>";
      
      let subtitleElement;
      if (subtitle) {
        subtitleElement = document.createElement("p");
        subtitleElement.className = "subtitle";
        subtitleElement.textContent = `(${subtitle})`;
      }
      
      const siteElement = document.createElement("p");
      siteElement.textContent = `Site: ${result.siteName}`;
      
      resultElement.appendChild(titleElement);
      if (subtitleElement) {
        resultElement.appendChild(subtitleElement);
      }
      resultElement.appendChild(siteElement);
      
      resultElement.addEventListener("click", () => {
        // set link input to the song's link
        setLinkInput(songInfo.url);
        
        // scroll to the link input
        linkInput.scrollIntoView({ behavior: "smooth" });
      });
      
      songsContainer.appendChild(resultElement);
    }
  }
  
  function displayLyrics(lyrics) {
    // clear previous lyrics
    while (lyricsContainer.firstChild) {
      lyricsContainer.removeChild(lyricsContainer.firstChild);
    }
    
    if (lyrics.rubyLyrics) {
      lyricsContainer.innerHTML = lyrics.rubyLyrics;
    } else {
      let newLyrics = lyrics.lyrics;
      // replace newlines with <br> tags
      newLyrics = newLyrics.replace(/\n/g, "<br>");
      lyricsContainer.innerHTML = newLyrics;
    }
  }
  
  getLyricsButton.addEventListener("click", async () => {
    const link = linkInput.value;
    if (!link) {
      lyricsContainer.textContent = "Please enter a link to fetch lyrics.";
      return;
    }
    
    // fetch lyrics
    const lyrics = await fetchLyrics(link);
    
    // display lyrics
    console.log("Fetched Lyrics:", lyrics);
    
    displayLyrics(lyrics);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}