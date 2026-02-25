import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createMessage, listMessages, deleteMessage } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  messages: router({
    list: publicProcedure.query(async () => {
      return await listMessages(100);
    }),
    create: protectedProcedure
      .input(
        z.object({
          text: z.string().max(5000).optional(),
          attachments: z.array(
            z.object({
              fileUrl: z.string(),
              fileKey: z.string(),
              fileName: z.string(),
              fileType: z.string(),
              fileSize: z.number(),
            })
          ).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Not authenticated");
        
        if (!input.text && (!input.attachments || input.attachments.length === 0)) {
          throw new Error("Message must have text or attachments");
        }

        return await createMessage(
          ctx.user.id,
          input.text,
          input.attachments
        );
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Not authenticated");
        return await deleteMessage(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
