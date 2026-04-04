import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getAllTrips = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let trips;

    if (args.status) {
      trips = await ctx.db
        .query("trips")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .order("desc")
        .take(args.limit || 20);
    } else {
      trips = await ctx.db
        .query("trips")
        .order("desc")
        .take(args.limit || 20);
    }

    // Get author details for each trip
    const tripsWithAuthors = await Promise.all(
      trips.map(async (trip) => {
        const author = await ctx.db.get(trip.authorId);
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", trip.authorId))
          .unique();

        return {
          ...trip,
          author: {
            name: profile?.name || author?.name || "Unknown",
            avatar: profile?.avatar,
          },
        };
      })
    );

    return tripsWithAuthors;
  },
});

export const getTripById = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) return null;

    const author = await ctx.db.get(trip.authorId);
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", trip.authorId))
      .unique();

    // Resolve invited friend details
    let invitedFriendDetails: { userId: string; name: string; avatar?: string }[] = [];
    if (trip.invitedFriends && trip.invitedFriends.length > 0) {
      invitedFriendDetails = await Promise.all(
        trip.invitedFriends.map(async (friendId) => {
          const friendProfile = await ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", friendId))
            .unique();
          const friendUser = await ctx.db.get(friendId);
          return {
            userId: friendId,
            name: friendProfile?.name || (friendUser as any)?.name || "Unknown",
            avatar: friendProfile?.avatar,
          };
        })
      );
    }

    const openSlots = Math.max(0, trip.maxTravelers - trip.currentTravelers);

    return {
      ...trip,
      author: {
        name: profile?.name || author?.name || "Unknown",
        avatar: profile?.avatar,
      },
      invitedFriendDetails,
      openSlots,
    };
  },
});

export const createTrip = mutation({
  args: {
    destination: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    budget: v.number(),
    maxTravelers: v.number(),
    interests: v.array(v.string()),
    description: v.string(),
    imageUrl: v.optional(v.string()),
    invitedFriends: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create a trip");
    }

    const friendsList = args.invitedFriends || [];
    const initialTravelers = 1 + friendsList.length; // creator + invited friends

    const tripId = await ctx.db.insert("trips", {
      authorId: userId,
      destination: args.destination,
      startDate: args.startDate,
      endDate: args.endDate,
      budget: args.budget,
      maxTravelers: args.maxTravelers,
      currentTravelers: initialTravelers,
      interests: args.interests,
      description: args.description,
      status: initialTravelers >= args.maxTravelers ? "full" : "open",
      imageUrl: args.imageUrl,
      invitedFriends: friendsList.length > 0 ? friendsList : undefined,
    });

    // Auto-create accepted tripRequests for each invited friend
    for (const friendId of friendsList) {
      await ctx.db.insert("tripRequests", {
        tripId,
        requesterId: friendId,
        status: "accepted",
        message: "Invited by trip creator",
      });
    }

    return tripId;
  },
});

export const getUserTrips = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // 1. Get trips created by the user
    const createdTrips = await ctx.db
      .query("trips")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .order("desc")
      .collect();

    // 2. Get trips joined by the user
    const joinedRequests = await ctx.db
      .query("tripRequests")
      .withIndex("by_requester", (q) => q.eq("requesterId", userId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    const joinedTrips = await Promise.all(
      joinedRequests.map((req) => ctx.db.get(req.tripId))
    );

    // Filter out nulls and combine (ensuring no duplicates if user is author and requester somehow)
    const validJoinedTrips = joinedTrips.filter((t): t is NonNullable<typeof t> => t !== null);
    const allUserTripsMap = new Map();
    [...createdTrips, ...validJoinedTrips].forEach(trip => {
      allUserTripsMap.set(trip._id.toString(), trip);
    });

    const allUserTrips = Array.from(allUserTripsMap.values());

    // 3. Populate author details for TripCard compatibility
    const tripsWithAuthors = await Promise.all(
      allUserTrips.map(async (trip) => {
        const author = await ctx.db.get(trip.authorId) as any;
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", trip.authorId))
          .unique();

        return {
          ...trip,
          author: {
            name: profile?.name || author?.name || "Unknown",
            avatar: profile?.avatar,
          },
        };
      })
    );

    return tripsWithAuthors.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const searchTrips = query({
  args: {
    destination: v.optional(v.string()),
    maxBudget: v.optional(v.number()),
    interests: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    let trips = await ctx.db.query("trips").collect();

    // Filter by destination
    if (args.destination) {
      trips = trips.filter(trip =>
        trip.destination.toLowerCase().includes(args.destination!.toLowerCase())
      );
    }

    // Filter by budget
    if (args.maxBudget) {
      trips = trips.filter(trip => trip.budget <= args.maxBudget!);
    }

    // Filter by interests
    if (args.interests && args.interests.length > 0) {
      trips = trips.filter(trip =>
        trip.interests.some(interest =>
          args.interests!.includes(interest)
        )
      );
    }

    // Get author details
    const tripsWithAuthors = await Promise.all(
      trips.map(async (trip) => {
        const author = await ctx.db.get(trip.authorId);
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", trip.authorId))
          .unique();

        return {
          ...trip,
          author: {
            name: profile?.name || author?.name || "Unknown",
            avatar: profile?.avatar,
          },
        };
      })
    );

    return tripsWithAuthors;
  },
});

export const getTripVerificationToken = mutation({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }

    // Check if user is the author or an accepted member
    const isAuthor = trip.authorId === userId;
    const acceptedRequest = await ctx.db
      .query("tripRequests")
      .withIndex("by_trip_and_requester", (q) =>
        q.eq("tripId", args.tripId).eq("requesterId", userId)
      )
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .unique();
    const isInvited = trip.invitedFriends?.includes(userId as any);

    if (!isAuthor && !acceptedRequest && !isInvited) {
      throw new Error("Not authorized to view verification QR");
    }

    // Check if there are at least 2 members
    if (trip.currentTravelers < 2) {
      return { success: false, message: "Trip must have at least 2 members to generate verification QR" };
    }

    // Return existing token or generate a new one
    if (trip.verificationToken) {
      return { success: true, token: trip.verificationToken };
    }

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    await ctx.db.patch(args.tripId, {
      verificationToken: token,
    });

    return { success: true, token };
  },
});

export const getTripByVerificationToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const trip = await ctx.db
      .query("trips")
      .withIndex("by_token", (q) => q.eq("verificationToken", args.token))
      .unique();

    if (!trip || trip.status === "completed") { // Or handle "cancelled" if status allows
      return null;
    }

    return {
      destination: trip.destination,
      status: trip.status,
    };
  },
});
