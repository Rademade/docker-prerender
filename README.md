## Env's:
- PRERENDER_NUM_WORKERS
- PRERENDER_NUM_ITERATIONS
- PRERENDER_NUM_SOFT_ITERATIONS
- JS_TIMEOUT
- PAGE_TTL
- REDIS_URL
- REMOVE_SCRIPT_TAGS

## Build:
- `docker build -t registry-jj.demo-rademade.com/prerender:v1 .`
- `docker push registry-jj.demo-rademade.com/prerender:v1`
