import { fetchLyrics, siteNames, sitesData } from "./fetcher/fetchLyrics.js";

async function test() {
  const info = {
    title: "a",
  };
  
  const testResults = await sitesData.imicom.fetchSongs(info);
  // const testResults = await fetchSongs(info);
  console.log("Fetched Songs Results:", testResults);
}

test();