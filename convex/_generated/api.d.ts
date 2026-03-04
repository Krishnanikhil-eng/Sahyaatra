/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as budgets from "../budgets.js";
import type * as http from "../http.js";
import type * as importPlaces from "../importPlaces.js";
import type * as messages from "../messages.js";
import type * as places from "../places.js";
import type * as profiles from "../profiles.js";
import type * as reports from "../reports.js";
import type * as router from "../router.js";
import type * as states from "../states.js";
import type * as storage from "../storage.js";
import type * as tripRequests from "../tripRequests.js";
import type * as trips from "../trips.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  auth: typeof auth;
  budgets: typeof budgets;
  http: typeof http;
  importPlaces: typeof importPlaces;
  messages: typeof messages;
  places: typeof places;
  profiles: typeof profiles;
  reports: typeof reports;
  router: typeof router;
  states: typeof states;
  storage: typeof storage;
  tripRequests: typeof tripRequests;
  trips: typeof trips;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
