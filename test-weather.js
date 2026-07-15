const apiKey = process.env.OPENWEATHER_API_KEY || "e867ed2321b6e34da68a2baa4909b264";
const url = `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${apiKey}`;

console.log("Testing fetch to:", url);

async function test() {
  try {
    const start = Date.now();
    const res = await fetch(url);
    const end = Date.now();
    console.log("Status:", res.status);
    console.log("Time taken:", end - start, "ms");
    if (res.ok) {
      const data = await res.json();
      console.log("Success! Data received.");
    } else {
      console.log("Failed:", res.statusText);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

test();
