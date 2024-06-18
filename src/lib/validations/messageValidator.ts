import { z } from "zod";

export const messageValidator = z.object({
  id: z.string(),
  text: z.string().max(2000),
  senderId: z.string(),
  receiverId: z.string(),
  timestamp: z.number(),
});

export const messageArrayValidator = z.array(messageValidator);

export type Message = z.infer<typeof messageValidator>;
