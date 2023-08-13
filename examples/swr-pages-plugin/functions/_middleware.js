import pagesSwr from 'pages-plugin-swr';

export async function onRequest(context) {
  return pagesSwr({
    resolve304s: false
  })(context);
}
