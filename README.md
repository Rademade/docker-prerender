## Env's:
- PRERENDER_NUM_WORKERS
- PRERENDER_NUM_ITERATIONS
- PRERENDER_NUM_SOFT_ITERATIONS
- JS_TIMEOUT
- PAGE_TTL
- REDIS_URL
- REMOVE_SCRIPT_TAGS

## Build:
- `docker build -t registry.demo-rademade.com/prerender:v1 .`
- `docker login -u $USER registry.rademade.com`
- `docker push registry.demo-rademade.com/prerender:v1`
