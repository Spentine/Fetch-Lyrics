async function fetchLyrics(info) {
  const api = "http://localhost:8400/api/fetchLyrics";
  
  // use this once it's in prod
  // const api = "https://spentine.com/api/fetchLyrics";
  
  const params = new URLSearchParams(info);
  const url = `${api}?${params.toString()}`;
  console.log("Fetching lyrics from:", url);

  const response = await fetch(url);
  const data = await response.json();

  return data;
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
  
  searchButton.addEventListener("click", async () => {
    const info = {
      title: titleInput.value,
      artist: artistInput.value,
      lyricist: lyricistInput.value,
      composer: composerInput.value,
      opening: openingInput.value,
      contains: containsInput.value,
    };
    
    // fetch lyrics
    const results = await fetchLyrics(info);
    
    // display results
    console.log("Fetched Lyrics Results:", results);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}