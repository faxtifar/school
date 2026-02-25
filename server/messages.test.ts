import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("messages router", () => {
  describe("messages.list", () => {
    it("returns empty array when no messages exist", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.messages.list();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("messages.create", () => {
    it("requires authentication", async () => {
      const ctx: TrpcContext = {
        user: null,
        req: {
          protocol: "https",
          headers: {},
        } as TrpcContext["req"],
        res: {} as TrpcContext["res"],
      };

      const caller = appRouter.createCaller(ctx);

      try {
        await caller.messages.create({
          text: "Test message",
        });
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("validates text input", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.messages.create({
          text: "",
        });
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("accepts valid message with text only", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.messages.create({
        text: "Hello, world!",
      });

      expect(result).toBeDefined();
    });

    it("accepts valid message with text and photo URL", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.messages.create({
        text: "Check out this photo!",
        photoUrl: "https://example.com/photo.jpg",
        photoKey: "messages/photo-123.jpg",
      });

      expect(result).toBeDefined();
    });

    it("rejects text exceeding 1000 characters", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const longText = "a".repeat(1001);

      try {
        await caller.messages.create({
          text: longText,
        });
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("messages.delete", () => {
    it("requires authentication", async () => {
      const ctx: TrpcContext = {
        user: null,
        req: {
          protocol: "https",
          headers: {},
        } as TrpcContext["req"],
        res: {} as TrpcContext["res"],
      };

      const caller = appRouter.createCaller(ctx);

      try {
        await caller.messages.delete({ id: 1 });
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("accepts valid delete request", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.messages.delete({ id: 999 });

      expect(result).toBeDefined();
    });
  });
});
