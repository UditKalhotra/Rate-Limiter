import client from "./client";

/* ---------------- Auth ---------------- */
// POST /auth/signup  { name, email, password } -> { message, user }
export const signup = (payload) => client.post("/auth/signup", payload);

// POST /auth/login  { email, password } -> { message, token }
export const login = (payload) => client.post("/auth/login", payload);

/* ---------------- API keys ---------------- */
// GET /api-key/register -> { apiKeys: [...] }
export const getApiKeys = () => client.get("/api-key/register");

// POST /api-key/register { name } -> { message, apiKey } (plaintext, shown once)
export const createApiKey = (name) =>
  client.post("/api-key/register", { name });

// DELETE /api-key/register/:id -> { message }
export const deleteApiKey = (id) => client.delete(`/api-key/register/${id}`);

// GET /api-key/register/:id/reveal -> { apiKey } (decrypted, on demand)
export const revealApiKey = (id) => client.get(`/api-key/register/${id}/reveal`);

// PATCH /api-key/:id/revoke -> { message, apikey }
export const revokeApiKey = (id) => client.patch(`/api-key/${id}/revoke`);

/* ---------------- Rules ----------------
   Rule endpoints are guarded by an x-api-key header on the backend
   (apikeyAuth middleware), so every call below needs the API key the
   rule belongs to, passed alongside the JWT. */
const withApiKey = (apiKey) => ({ headers: { "x-api-key": apiKey } });

// GET /rule -> { status, Rules }
export const getRules = (apiKey) => client.get("/rule", withApiKey(apiKey));

// POST /rule { endpoint, method, limit, window, algorithm, capacity, refillRate }
export const createRule = (apiKey, payload) =>
  client.post("/rule", payload, withApiKey(apiKey));

// PATCH /rule/:id
export const updateRule = (apiKey, id, payload) =>
  client.patch(`/rule/${id}`, payload, withApiKey(apiKey));

// DELETE /rule/:id
export const deleteRule = (apiKey, id) =>
  client.delete(`/rule/${id}`, withApiKey(apiKey));

/* ---------------- Test console ---------------- */
// GET/POST /api/test -> hits the live rate limiter with the given API key
export const runTest = (apiKey, method = "GET") =>
  client.request({
    url: "/api/test",
    method,
    headers: { "x-api-key": apiKey }
  });

// POST /api/v1/check { resource, method, clientId } -> { allowed, remaining, reset }
export const checkLimit = (apiKey, payload) =>
  client.post("/api/v1/check", payload, withApiKey(apiKey));

/* ---------------- Analytics ---------------- */
// GET /analysis/used -> { overview, topAPIs, abusiveKeys, traffic }
export const getDashboard = () => client.get("/analysis/used");

// GET /analysis/stats -> { totalRequests, allowedRequests, blockedRequests } (ADMIN only)
export const getStats = () => client.get("/analysis/stats");
