# Fetch Lyrics

This project should fetch lyrics from different sites. It should preferably have Japanese support, but also support other songs. It will be an API where a `GET` request fetches song lyrics. There should also be a frontend to interact, but it's optional.

## Sites

Popular song lyric sites will be added:

- (Japanese)
  - Utaten
  - Uta-Net
  - Vocaloid Lyrics Wiki (if possible)

- (English and International)
  - Genius
  - Spotify (if possible)

## API

```js
const info = {
  title,
  artist,
  singer,
  lyricist,
  composer,
  openingLyric,
  partOfLyric
}
```

Results will be returned in an array.