import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Search registered users by name for the "Traveling With" friend invite feature.
 * Returns matching profiles excluding the current user.
 */
export const searchUsers = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const term = args.searchTerm.trim().toLowerCase();
    if (term.length < 2) return []; // require at least 2 chars

    // Fetch all profiles and filter by name match (Convex doesn't have LIKE queries)
    const allProfiles = await ctx.db.query("profiles").collect();

    const matches = allProfiles
      .filter((profile) => {
        // Exclude the current user
        if (profile.userId === userId) return false;
        // Match by name (case-insensitive substring)
        return profile.name.toLowerCase().includes(term);
      })
      .slice(0, 10); // limit results

    return matches.map((profile) => ({
      userId: profile.userId,
      name: profile.name,
      avatar: profile.avatar || null,
    }));
  },
});
