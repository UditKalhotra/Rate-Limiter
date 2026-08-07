local bucket = redis.call("HMGET", KEYS[1], "tokens", "lastRefill")

local tokens = tonumber(bucket[1])
local lastRefill = tonumber(bucket[2])

local capacity = tonumber(ARGV[1])
local refillRate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

if tokens == nil then
    tokens = capacity
    lastRefill= now
end

local elapsed = (now - lastRefill) / 1000

local refillTokens = math.floor(elapsed * refillRate)


if refillTokens > 0 then

    tokens = math.min(
        capacity,
        tokens + refillTokens
    )

    lastRefill = now

end

local allowed = 0

if tokens > 0 then

    tokens = tokens - 1
    allowed = 1

end

redis.call(
    "HMSET",
    KEYS[1],
    "tokens",
    tokens,
    "lastRefill",
    lastRefill
)


return {
    allowed,
    tokens,
    lastRefill
}