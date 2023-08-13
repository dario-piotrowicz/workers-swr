export type PluginArgs = {
  /**
   * Cached requests can result in 304 responses, this might be unwanted, so
   * those can be resolved by the plugin (so that the client never sees such 304 responses)
   *
   * Defaults to true.
   *
   * (if you do want the client to receive 304 responses set this to false)
   */
  resolve304s: boolean;
};


/**
 * Generates a handler for your GET requests.
 *
 * @param args Currently the plugin does not accept any argument
 * @returns the pages functions handler
 */
export default function (args: PluginArgs): PagesFunction;