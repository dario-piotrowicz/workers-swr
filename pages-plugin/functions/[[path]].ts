import { withSWR } from 'workers-swr';
import { PluginArgs } from '..';

type SwrPluginFunction<
  Env = unknown,
  Params extends string = any,
  Data extends Record<string, unknown> = Record<string, unknown>
> = PagesPluginFunction<Env, Params, Data, PluginArgs>;

export const onRequest: SwrPluginFunction = async (context) => {
  return withSWR(() => context.next())(context.request, context.env, context);
};