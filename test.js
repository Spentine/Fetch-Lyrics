import { fetchLyrics, fetchSongs, siteNames, sitesData } from "./fetcher/fetchLyrics.js";

async function test() {
  const info = {
    title: "アブジェ",
  };
  
  // const testResults = await sitesData.imicom.fetchSongs(info);
  // const testResults = await fetchSongs(info);
  const testResults = await sitesData.utaten.fetchLyrics("https://utaten.com/lyric/ja00004664/");
  console.log("Fetched Songs Results:", testResults);
}

test();