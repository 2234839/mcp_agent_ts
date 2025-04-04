import { Effect } from 'effect';
import { McpClientService } from 'src/service';

export function callTool(callToolReq: { name: string; arg: any }[]) {
  return Effect.gen(function* () {
    const client = yield* McpClientService;
    const callToolRes = yield* Effect.tryPromise(() =>
      Promise.all(
        callToolReq?.map(async ({ name, arg }) => {
          return {
            res: await client.callTool({
              name: name ?? 'unkown',
              arguments: arg,
            }),
            name,
            arg,
          };
        }) ?? [],
      ),
    );
    return callToolRes;
  });
}
