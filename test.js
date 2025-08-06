import { fetchLyrics, fetchSongs, siteNames, sitesData } from "./fetcher/fetchLyrics.js";

async function test() {
  const info = {
    title: "アブジェ",
  };
  
  // const testResults = await sitesData.imicom.fetchSongs(info);
  // const testResults = await fetchSongs(info);
  const testResults = await sitesData.imicom.fetchLyrics("https://lyrics.imicomweb.com/songs/1513/");
  console.log("Fetched Songs Results:", testResults);
}

test();