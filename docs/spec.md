## Spec

**functional req**
- create shorten URL
- redirect shorten URL to long URL
- get statistics of short URL: number of clicks
- UI: same as [URL Shortener: Free URL Shortening](https://www.shorturl.at/)

**non-functional req**
- create shorten URL respond: p99 200ms locally, deployed ver later think
- handle concurrent request correctly, e.g. 2 users create shorten URL at the same time, both should get correct result (? how to test this)
- rate limit: ? for the same ip addr?
- localhost for now, no need to deploy

**api design**

GET {shortenURL}: redirect to long URL, 302 no cache

GET /api/v1/{shortenURL}/stat
res: {longURL: ..., clicks: ...}

POST /api/v1/shorten
body: {longURL: ...}
res: {shortenURL: ...}

**db**

table shortURL
- shortenURL: pk, therefore index as well, string
- longURL: string 
- clicks: int
- createdAt: Date

**high level design (archi)**
see [[URL shortener archi]]
api gateway?
redis

**deep dives**
- how to generate short URL
	- shortenURL: e.g. https://localhost:3000/XXXXXX
	- 6 digit in base62 encoding (a-z, A-Z, 0-9), ie ~56.8B possible combination
	- generate: random + retry
	- db pk constr ensure concurrent POST shortenURL is safe
- how to retreive long URL from short URL
	- redis for caching the recently used shortendURL
	- if not found, look up in db
	- has index on shortendURL (pk)
	- increase cnt in db: no need wrap in txn. do after res otherwise slow, how?
	- ? time for the db ops?
- analytics
	- get count from db, i think no need cache

**edge**
allow duplicated shortening of the same longURL for now

**tech stack**
layered archi
React
TS, express: middleware, router, controller, service
redis
sqlite

[How To Build A URL Shortener With Node.js, Express, and MongoDB](https://www.youtube.com/watch?v=SLpUKAGnm-g)