This project should fetch lyrics from different sites. It should mainly have Japanese support. It will be an API where a `GET` request fetches song lyrics. There should also be a frontend to interact.

# API

## Sites

Japanese song lyric sites will be added:

- (Japanese)
  - Utaten
  - Uta-Net

## Fetch Songs API

Make a `GET` request to `https://spentine.com/fL/api/fetchSongs` with the following query parameters:

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

The results will be returned in an array of songs, where the format for one song is below.

```js
{
  "site": /* {string} name of site in more program-friendly format */
  "siteName": /* {string} name of site in human-friendly format */
  "url": /* site hostname */
  "songInfo": [
    {
      "url": /* {string} link to page for song */
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
      
      // the bottom two keys may or may not exist
      "beginning": /* {string} the beginning of the lyrics in raw text format*/
      "lyricsSample": /* {string} a sample of the lyrics */
    },
  ]
}
```

## Fetch Lyrics API

Make a `GET` request to `https://spentine.com/fL/api/fetchLyrics` with the `link` query parameter set to the link of the lyrics page. The links can only be to UtaTen or UtaNet because that's all I implemented. The links can be attained by getting it from the songs themselves.

The results will be returned in a JSON, where the `lyrics` key contains the lyrics. If the lyrics was pulled from UtaTen, then an additional key `lyricsRuby` will contain XML to include furigana (ruby text) in the lyrics.

# Web Frontend

To use the frontend, specify the filters to search the song, and then press the **"Search"**. Then, a list of songs will appear. Click the one that you desire and it will automatically set the link for the last part. Then, click **"Get Lyrics"** to retrieve the lyrics. It will appear at the very bottom.

## Example Queries:

> **1.** Title: **∴∴∴∴**
>
> Lyrics: 放浪を続けて辿どり着いた、 ... (*After I continued my wanderings and finally arrived, ...*)

> **2.** Contains: **もしもわたしに翼があれば** (*What if I had wings,*)
> 
> Title: さよーならまたいつか！ (*Farewell, we'll meet again someday!*)
> 
> Lyrics: どこから春が巡り来るのか　知らず知らず大人になった ... (*Where does spring come from? Without realizing, I became an adult ...*)

> **3.** Title: **拝啓** (*Dear*), Artist: **ぺぽよ** (*PEPOYO*)
>
> Lyrics: 救いをもたらす天上に伸びる蜘蛛の糸 (*A spider's thread stretching to the heavens brings salvation*)