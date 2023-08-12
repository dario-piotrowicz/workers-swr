
document.addEventListener('alpine:init', () => {
  Alpine.store('responsesFromWorker', {
    responses: [],
   
    get lastResponse() {
      return this.responses[this.responses.length - 1];
    },
 
    async fetchNew(route, { maxAge, swr, sie, error, cacheErrors }) {
      const resp = await fetch(
        `https://workers-swr-example-worker.dariopiot.net/${route}`,
        {
          headers: {
            'x-workers-swr-demo-request-values':
              JSON.stringify({
                maxAge,
                swr,
                sie,
                error,
                cacheErrors,
              })
          },
        }
      );
      this.responses.push({
        receivedAt: new Date().toISOString(),
        responseText: await resp.text()
      });
    }
  });
}, { once: true });

function getRandomRoute() {
 return Math.random().toString(36).slice(2, 7);
}
