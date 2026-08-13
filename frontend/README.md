# RateGate Frontend

A React (Vite) dashboard for the [Rate-Limiter](https://github.com/UditKalhotra/Rate-Limiter) backend: sign up / log in, issue API keys, attach rate limit rules to endpoints, and fire test traffic at the live limiter.

## Stack

- React 18 + Vite
- react-router-dom for routing
- axios for API calls
- recharts for the traffic chart
- Plain CSS with a small design-token system (no UI kit) — see `src/index.css`

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_URL to your backend, e.g. http://localhost:4000
npm run dev
```

The backend expects `PORT` (defaults to 4000), `JWT_SECRET`, Mongo, and Redis connection info in its own `.env` — see `server.js` / `db/db.js` / `config/redis.js` in the backend repo.

## Recent additions

- **Dashboard logout** — a visible "Log out" button next to the dashboard heading, in addition to the icon button in the sidebar footer.
- **Burst sending in the Test Console** — a dropdown (5/10/15/20/25/50) plus a "Send N requests" button that fires that many requests at `/api/test` concurrently and shows an allowed/blocked summary, so you can actually see a limit trip instead of clicking one at a time.
- **Real names** — the sidebar and dashboard now show the name you typed at signup instead of a guess from your email. Since `POST /auth/login` only returns a token (no name), the app remembers `email → name` locally in the browser the moment you sign up, then looks it up after login. Accounts created before this change, or signed in from a browser that never saw the signup, fall back to a capitalized version of the email's local part.

## Pages

| Page | Route | Backend endpoints used |
|---|---|---|
| Login | `/login` | `POST /auth/login` |
| Signup | `/signup` | `POST /auth/signup` |
| Dashboard | `/` | `GET /analysis/used` |
| API Keys | `/api-keys` | `GET /api-key/register`, `POST /api-key/register`, `DELETE /api-key/register/:id`, `PATCH /api-key/:id/revoke` |
| Rules | `/rules` | `GET /rule`, `POST /rule`, `PATCH /rule/:id`, `DELETE /rule/:id` |
| Test Console | `/test-console` | `GET|POST /api/test`, `POST /api/v1/check` |

## Before this will run end-to-end, three backend fixes are needed

I read through the live repo to wire this up exactly, and found a few things that will block the frontend until fixed:

1. **CORS isn't enabled.** `app.js` requires `cors` as a dependency but never calls `app.use(cors())`. Every request from a browser on a different port (like this dashboard on `:5173`) will be blocked. Fix:
   ```js
   const cors = require("cors");
   app.use(cors());
   ```

2. **`GET /rule` and `PATCH /rule/:id` are missing the `apikeyAuth` middleware.** Both controllers read `req.apikey.owner`, but the routes only call `protect`/nothing, so `req.apikey` is `undefined` and the request 500s. Fix in `route/ruleRoute.js`:
   ```js
   router.route('/rule')
     .get(protect, apiAuth, ruleController.getallRules)
     .post(protect, apiAuth, ruleController.createRule);

   router.route('/rule/:id')
     .patch(protect, apiAuth, ruleController.updateRule)
     .delete(protect, apiAuth, ruleController.DeleteRule);
   ```

3. **`DELETE /api-key/register/:id` and `PATCH /api-key/:id/revoke` are missing `protect`.** Both controllers use `req.user.id`, which will be `undefined` without it. Fix in `route/apikeyroute.js` by adding `protect` to those two routes the same way `/register` already does.

None of these are frontend issues — the requests and headers this app sends already match what the controllers expect once the middleware is attached.

## Note on rule writes and the raw API key

`POST /rule`, `PATCH /rule/:id`, and `DELETE /rule/:id` are authenticated with the raw `x-api-key` header value (via `apikeyAuth`), not the key's database ID — and the backend only ever returns that raw value once, at creation time (`apiController.createAPIkey`). The Rules page can't recover it afterwards, so it asks you to paste the key you saved when you created it before writing a rule. If you'd rather not re-paste it each time, the more typical fix is to scope rule routes off the key's ID instead of its secret value — worth considering for a v2.
