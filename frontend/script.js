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
  
  // results container
  const resultsContainer = document.getElementById("resultsContainer");
  
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
      
      songsContainer.appendChild(resultElement);
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}