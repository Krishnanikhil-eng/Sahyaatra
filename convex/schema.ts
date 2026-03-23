import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // States data for India map
  states: defineTable({
    code: v.string(),
    name: v.string(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
    attractions: v.array(v.string()),
    bestTime: v.string(),
  }).index("by_code", ["code"]),

  // Verification Codes
  verificationCodes: defineTable({
    userId: v.optional(v.id("users")),
    email: v.optional(v.string()),
    code: v.string(),
    expiresAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_email", ["email"]),

  // User profiles
  profiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    bio: v.optional(v.string()),
    interests: v.array(v.string()),
    verified: v.boolean(),
    emailVerified: v.optional(v.boolean()),
    avatar: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // Trips posted by users
  trips: defineTable({
    authorId: v.id("users"),
    destination: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    budget: v.number(),
    maxTravelers: v.number(),
    currentTravelers: v.number(),
    interests: v.array(v.string()),
    description: v.string(),
    status: v.union(v.literal("open"), v.literal("full"), v.literal("completed")),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.string()),
    imageName: v.optional(v.string()),
    imageSize: v.optional(v.number()),
    imageType: v.optional(v.string()),
    verificationToken: v.optional(v.string()),
    invitedFriends: v.optional(v.array(v.id("users"))),
  }).index("by_author", ["authorId"])
    .index("by_status", ["status"])
    .index("by_destination", ["destination"])
    .index("by_token", ["verificationToken"]),

  // Trip join requests
  tripRequests: defineTable({
    tripId: v.id("trips"),
    requesterId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected")),
    message: v.optional(v.string()),
  }).index("by_trip", ["tripId"])
    .index("by_requester", ["requesterId"])
    .index("by_trip_and_requester", ["tripId", "requesterId"]),

  // Chat messages
  messages: defineTable({
    tripId: v.id("trips"),
    senderId: v.id("users"),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("system")),
  }).index("by_trip", ["tripId"]),

  // Budget planning
  budgets: defineTable({
    tripId: v.id("trips"),
    userId: v.id("users"),
    categories: v.object({
      travel: v.number(),
      food: v.number(),
      stay: v.number(),
      activities: v.number(),
      misc: v.number(),
    }),
    totalBudget: v.number(),
  }).index("by_trip", ["tripId"])
    .index("by_user", ["userId"]),

  // Expenses tracking
  expenses: defineTable({
    budgetId: v.id("budgets"),
    category: v.union(
      v.literal("travel"),
      v.literal("food"),
      v.literal("stay"),
      v.literal("activities"),
      v.literal("misc")
    ),
    amount: v.number(),
    description: v.string(),
    date: v.string(),
  }).index("by_budget", ["budgetId"]),

  // AI generated itineraries
  itineraries: defineTable({
    tripId: v.id("trips"),
    userId: v.id("users"),
    destination: v.string(),
    days: v.array(v.object({
      day: v.number(),
      title: v.string(),
      activities: v.array(v.string()),
      estimatedCost: v.number(),
    })),
    totalEstimatedCost: v.number(),
    preferences: v.object({
      budget: v.number(),
      interests: v.array(v.string()),
      travelers: v.number(),
    }),
  }).index("by_trip", ["tripId"])
    .index("by_user", ["userId"]),

  // Tourist places from CSV data
  places: defineTable({
    state: v.string(),
    stateCode: v.string(),
    placeName: v.string(),
    category: v.string(),
    description: v.optional(v.string()),
    timings: v.optional(v.string()),
    entryFee: v.optional(v.string()),
    bestTime: v.optional(v.string()),
    nearestRailway: v.optional(v.string()),
    nearestBus: v.optional(v.string()),
    nearestAirport: v.optional(v.string()),
    metroStation: v.optional(v.string()),
    accessibility: v.optional(v.string()),
    guidedTours: v.optional(v.string()),
    parking: v.optional(v.string()),
    nearbyAmenities: v.optional(v.string()),
    officialWebsite: v.optional(v.string()),
    wikipedia: v.optional(v.string()),
    specialNotes: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_state", ["stateCode"])
    .index("by_category", ["category"])
    .index("by_place_name", ["placeName"]),

  // User submitted issue reports
  reports: defineTable({
    name: v.string(),
    email: v.string(),
    type: v.string(),
    description: v.string(),
    status: v.union(v.literal("pending"), v.literal("in-progress"), v.literal("resolved"), v.literal("ignored")),
    createdAt: v.number(),
  }).index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
