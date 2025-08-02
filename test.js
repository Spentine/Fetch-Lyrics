import { fetchLyrics, siteNames, sitesData } from "./fetcher/fetchLyrics.js";

async function test() {
  const info = {
    title: "raison d'etre",
  };
  
  // const testResults = await sitesData.utaten.fetchLyrics(info);
  const testResults = await fetchLyrics(info);
  console.log("Fetched Lyrics Results:", testResults);
}

test();