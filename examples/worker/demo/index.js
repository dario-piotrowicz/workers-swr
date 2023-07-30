
document.addEventListener('alpine:init', () => {
  Alpine.store('responsesFromWorker', {
    responses: [],
   
    get lastResponse() {
      return this.responses[this.responses.length - 1];
    },
 
    async fetchNew(route, { maxAge, swr, sie, error }) {
      const resp = await fetch(
        `https://workers-swr-example-worker.dariopiot.net/${route}`,
        {
          headers: {
            'x-workers-swr-demo-request-values': `{ "maxAge": ${maxAge}, "swr": ${swr}, "sie": ${sie}, "error": ${error ?? 'false' } }`,
          },
        }
      );
      const text = await resp.text();
      this.responses.push(text);
    }
  });
}, { once: true });

function getRandomRoute() {
 return Math.random().toString(36).slice(2, 7);
}
