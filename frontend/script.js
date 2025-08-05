function fetchLyrics(info) {
  const api = "http://localhost:8400/api/fetchLyrics";
  
  // use this once it's in prod
  // const api = "https://spentine.com/api/fetchLyrics";
  
  const params = new URLSearchParams(info);
  const url = `${api}?${params.toString()}`;
}

function main() {
  
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}