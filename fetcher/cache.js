// cache some query results to avoid repeated requests

const cache = [];

function check(query) {
  // check if query is already cached
  const item = cache.find(item => item.query === query);
  if (item) return item;
  return null;
}

function add(query, result) {
  // add query result to cache
  cache.push({ query, result });
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

export { check, add, convertQueryToString };