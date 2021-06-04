# Preprocessor

## Pre-requisites

- NodeJS 8+ or Docker

## Setup environment variables

Copy `.env.example` to `.env` & modify env vars.
If you want to run with docker remember to change `localhost` to `host.docker.internal`.

## Start the server

### Without docker

Run these from preprocessor directory.

Install packages:

```bash
npm i
```

Build project:

```bash
npm run build
```

Run service, `DEBUG=svc:*` for seeing debug log

```bash
DEBUG=svc:* node dist/main.js
```

### With Docker

I have updated root docker compose file for new service.

```bash
# run this from project root
docker-compose up -d
```

## Design questions answers

1. How does your application scale and guarantee near-realtime processing when the incoming traffic increases? Where are the possible bottlenecks and how to tackle those?

It can be scaled to unlimited in the sense of reading messages from sqs, but will add cost for publishing events kinesis. I’m publishing each event separately which will generate huge http calls. I can’t use kinesis bulk api for maintaining order. Once we scale our stream to multiple shards, there’s no mechanism that we can use to guarantee that records are consumed in order across the whole stream; only within a single shard. So instead of focusing on a global guarantee of ordering, we should instead try to leverage techniques that will get us as much throughput as possible, and fall back to techniques that allow us to control for certain subsets of records where we deem it necessary.

2. What kind of metrics would you collect from the application to get visibility to its througput, performance and health?

- Average Response Time
- Error Rates
- Count of Application Instances (replicas)
- Request Rate
- Application’s CPU & Memory consumption
- Application Availability
- User Satisfaction
- Long running database queries

3. How would you deploy your application in a real world scenario? What kind of testing, deployment stages or quality gates you would build to ensure a safe production deployment?

I go through some checklists before deploying any application to production, I mostly follow the 12 factor guide. For code coverage, I do unit, integration, and feature testing. I test on multiple stages before deploying an application, development, staging, production. Here are some of my checklist:

- Auditing third party packages
- Save no data locally on a specific web server
- Logging & monitoring enabled
- Add caching wherever possible for reducing db queries
- Use SSL/TLS to encrypt the client-server connection
- Compress server responses
- Deploying with CI tools to detect failures before sending to production
- Validate and sanitize every user input
- Rate limiting - for slowing down brute force attack
