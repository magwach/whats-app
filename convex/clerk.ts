"use node";

import type { WebhookEvent } from "@clerk/express";
import { v } from "convex/values";

import { Webhook } from "svix";

import { internalAction } from "./_generated/server";

const WEB_HOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET as string;

export const fulfill = internalAction({
  args: {
    headers: v.any(),
    payload: v.string(),
  },
  handler: async (ctx, args) => {
    const wh = new Webhook(WEB_HOOK_SECRET);
    const payload = wh.verify(args.payload, args.headers) as WebhookEvent;

    return payload;
  },
});

// https://docs.convex.dev/functions/internal-functions
// When you run npx convex dev it creates a tsconfig.ts file, init? My project doesn't have it under /convex dir could that be the problem?
// https://evident-hornet-54.accounts.dev/sign-in/sso-callback?sign_up_fallback_redirect_url=http%3A%2F%2Flocalhost%3A3000%2F&sign_in_fallback_redirect_url=http%3A%2F%2Flocalhost%3A3000%2F&redirect_url=http%3A%2F%2Flocalhost%3A3000%2F
