local bucket = redis.call("HMGET", KEYS[1], "tokens", "lastRefill")

local tokens = tonumber(bucket[1])
local lastRefill = tonumber(bucket[2])

local capacity = tonumber(ARGV[1])
local refillRate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

-- Initialize new bucket if key doesn't exist
if tokens == nil then
    tokens = capacity
    lastRefill = now
end

-- Calculate time passed in seconds
local elapsed = (now - lastRefill) / 1000

-- Calculate refilled tokens based on time passed
local refillTokens = elapsed * refillRate

if refillTokens > 0 then
    tokens = math.min(capacity, tokens + refillTokens)
    lastRefill = now
end

local allowed = 0

if tokens >= 1 then
    tokens = tokens - 1
    allowed = 1
end

-- Save updated values to Redis
redis.call("HMSET", KEYS[1], "tokens", tokens, "lastRefill", lastRefill)

-- Set a 1-hour TTL (3600 seconds) so inactive keys auto-delete
redis.call("EXPIRE", KEYS[1], 3600)

local reset = 0
if tokens < 1 and refillRate > 0 then
    reset = math.ceil((1 - tokens) / refillRate)
end

return {
    allowed,
    math.floor(tokens),
    reset
}