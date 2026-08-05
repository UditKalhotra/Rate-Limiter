local key = KEYS[1]

local limit = tonumber(ARGV[1])
local windowSize = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requestId = ARGV[4]


local windowStart = now - windowSize


redis.call(
    "ZREMRANGEBYSCORE",
    key,
    0,
    windowStart
)


local count = redis.call(
    "ZCARD",
    key
)


if count >= limit then
    local ttl = redis.call(
        "TTL",
        key
    )

    return {0,0,ttl}
end


redis.call(
    "ZADD",
    key,
    now,
    requestId
)


redis.call(
    "EXPIRE",
    key,
    math.ceil(windowSize / 1000)
)

local remaining = limit - count - 1

local reset = redis.call(
    "TTL",
    key
)


return {1,
remaining,
reset
}