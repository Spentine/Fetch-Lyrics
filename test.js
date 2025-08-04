import { fetchLyrics, siteNames, sitesData } from "./fetcher/fetchLyrics.js";

async function test() {
  const info = {
    title: "きみに回帰線",
  };
  
  // const testResults = await sitesData.utanet.fetchLyrics(info);
  const testResults = await fetchLyrics(info);
  console.log("Fetched Lyrics Results:", testResults);
}

test();