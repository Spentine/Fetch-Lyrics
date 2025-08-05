import { fetchSongs, siteNames, sitesData, requiredFields, fetchLyrics } from "../fetcher/fetchLyrics.js";

async function handleRequests(req) {
  const method = req.method;
  const url = new URL(req.url);
  const path = url.pathname;
  
  if (method === "GET") {
    // i will make everything /api/ even though it's a little unnecessary
    // like maybe i will make a frontend hosted here but idk
    if (path === "/api/fetchSongs") {
      const info = {};
      
      // extract query parameters and fill info object
      for (const field of requiredFields) {
        if (url.searchParams.has(field)) {
          info[field] = url.searchParams.get(field);
        }
      }
      
      console.log("Fetching songs with info:", info);
      const songResults = await fetchSongs(info);
      
      // return json response
      return new Response(JSON.stringify(songResults), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } else if (path === "/api/fetchLyrics") {
      const link = url.searchParams.get("link");
      if (!link) return new Response("Link parameter is required", {
        status: 400,
        headers: {
          "Content-Type": "text/plain",
          "Access-Control-Allow-Origin": "*",
        },
      });
      
      console.log("Fetching lyrics for link:", link);
      const lyrics = await fetchLyrics(link);
      if (!lyrics) return new Response("Lyrics not found", {
        status: 404,
        headers: {
          "Content-Type": "text/plain",
          "Access-Control-Allow-Origin": "*",
        },
      });

      // return json response
      return new Response(JSON.stringify(lyrics), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  } else if (method === "OPTIONS") {
    // handle preflight requests for CORS
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
  
  // if no matching route, return 404
  return new Response("Not Found", {
    status: 404,
    headers: {
      "Content-Type": "text/plain",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

Deno.serve(
  {
    port: 8400, // port for backend server
  },
  handleRequests,
);