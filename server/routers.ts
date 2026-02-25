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
          text: z.string().min(1).max(1000),
          photoUrl: z.string().optional(),
          photoKey: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Not authenticated");
        return await createMessage(
          ctx.user.id,
          input.text,
          input.photoUrl,
          input.photoKey
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
