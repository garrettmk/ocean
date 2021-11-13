import { assert, integer, object, optional, string } from "superstruct";

export type ServerConfig = {
  secret: string,
  port: number
};

export const serverConfig: ServerConfig = {
  secret: process.env.SERVER_SECRET ?? 'secret',
  port: parseInt(process.env.SERVER_PORT ?? '3000')
};

assert(serverConfig, object({
  secret: string(),
  port: integer()
}));