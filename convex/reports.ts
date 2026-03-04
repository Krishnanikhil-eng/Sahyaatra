import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        type: v.string(),
        description: v.string(),
    },
    handler: async (ctx, args) => {
        const reportId = await ctx.db.insert("reports", {
            name: args.name,
            email: args.email,
            type: args.type,
            description: args.description,
            status: "pending",
            createdAt: Date.now(),
        });

        return reportId;
    },
});
