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
  lyricist,
  composer,
  opening,
  contains
}
```

Results will be returned in an array.

### UtaTen format
```js
{
  "site": "utaten",
  "url": "https://utaten.com",
  "songInfo": [
    {
      "link": /* {string} link to utaten page for song */
      "title": /* {string} full title of song */
      "artists": [
        /*
          this format is used because there may be multiple artists who worked on the same component of a song
          for example, it is possible for two or more people to work on the composition
        */
        {
          "type": /* {"lyricist" | "composer" | "arranger"} the type of artist */
          "artists": /* {string[]} array of artists of a certain type */
        },
      ],
      "beginning": /* {string} the beginning of the lyrics in raw text format*/
      
      // if there is only one result for the song, return the below properties which contain the whole lyrics
      "lyrics": /* {string} raw text format */
      "rubyLyrics": /* {string} xml text format with ruby text */
    },
  ]
}