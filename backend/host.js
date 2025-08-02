import { fetchLyrics, siteNames, sitesData, requiredFields } from "../fetcher/fetchLyrics.js";

async function handleRequests(req) {
  const method = req.method;
  const url = new URL(req.url);
  const path = url.pathname;
  
  if (method === "GET") {
    // i will make everything /api/ even though it's a little unnecessary
    // like maybe i will make a frontend hosted here but idk
    if (path === "/api/fetchLyrics") {
      const info = {};
      
      // extract query parameters and fill info object
      for (const field of requiredFields) {
        if (url.searchParams.has(field)) {
          info[field] = url.searchParams.get(field);
        }
      }
      const songResults = await fetchLyrics(info);
      
      // return json response
      return new Response(JSON.stringify(songResults), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*", // allow CORS for all origins
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
      "Access-Control-Allow-Origin": "*", // allow CORS for all origins
    },
  });
}

Deno.serve(
  {
    port: 8400, // port for backend server
  },
  handleRequests,
);