import type { PagesFunction } from '@cloudflare/workers-types';

export type PluginArgs = undefined | {
  /** Whether 304 responses should be returned or not (defaults to false) */
  enable304Responses: boolean;
};

/**
 * Generates a handler for your GET requests.
 *
 * @param args Currently the plugin does not accept any argument
 * @returns the pages functions handler
 */
export default function (args?: Partial<PluginArgs>): PagesFunction;