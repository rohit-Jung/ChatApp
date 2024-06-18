const authToken = process.env.UPSTASH_REDIS_TOKEN;
const upstashRedisURL = process.env.UPSTASH_REDIS_URL;

type Command = "zrange" | "sismember" | "get" | "smembers";
export async function fetchRedis(
  command: Command,
  ...args: (string | number)[]
) {
  const commandURL = `${upstashRedisURL}/${command}/${args.join("/")}`;

  const response = await fetch(commandURL, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    cache: "no-cache",
  });

  if (!response.ok) {
    throw new Error(`Error executing redis command ${response.statusText}`);
  }

  const data = await response.json();
  return data.result;
}
