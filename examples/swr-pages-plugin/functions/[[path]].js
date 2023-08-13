export function onRequest(context) {
  return new Response(`Current Time: ${new Date().toISOString()}`, {
      status: 200,
      headers: {
        "Cache-Control": `max-age=1, stale-while-revalidate=5`,
      },
  })
}