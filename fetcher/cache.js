// cache some query results to avoid repeated requests

const songCache = [];

function checkSongCache(query) {
  // check if query is already cached
  const item = songCache.find(item => item.query === query);
  if (item) return item.result;
  return null;
}

function addSongCache(query, result) {
  // add query result to cache
  songCache.push({ query, result });
}

function convertQueryToString(info) {
  const correctOrdering = [
    "title", "artist", "lyricist", "composer", "opening", "contains"
  ];
  
  const q = [];
  for (const field of correctOrdering) {
    if (info[field]) {
      q.push(info[field]);
    } else {
      q.push("");
    }
  }
  
  return JSON.stringify(q);
}

const lyricsCache = [];

function checkLyricsCache(link) {
  // check if link is already cached
  const item = lyricsCache.find(item => item.link === link);
  if (item) return item.lyrics;

  return null;
}

function addLyricsCache(link, lyrics) {
  // add lyrics to cache
  lyricsCache.push({ link, lyrics });
}

export { checkSongCache, addSongCache, convertQueryToString, checkLyricsCache, addLyricsCache };