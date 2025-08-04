import { fetchLyrics, siteNames, sitesData } from "./fetcher/fetchLyrics.js";

async function test() {
  const info = {
    contains: "乙女解剖",
    artist: "DECO*27",
  };
  
  const testResults = await sitesData.utanet.fetchLyrics(info);
  // const testResults = await fetchLyrics(info);
  console.log("Fetched Lyrics Results:", testResults);
}

test();