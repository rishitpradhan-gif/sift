# Sift API

Download, unzip, run. Node.js 22+, no dependencies.

```sh
node server.mjs
curl http://127.0.0.1:8787/health
npm test
```

POST JSON to `/v1/profile`. See `openapi.json`. The server accepts up to 5 MiB per request, holds the request body in memory, and stores nothing on disk. Bind address defaults to loopback. Configure `HOST` and `PORT` as needed. Public deployments need your own TLS, authentication, rate limits, and process supervision. Dockerfile included.

Example: `{"csv":"id,value\n1,10\n2,\n"}`. Optional `baseline` is a previous report for schema drift. Run `node cli.mjs data.csv` for incremental file profiling with no total-file-size cap. Headers must be unique and nonempty. At most 128 columns, 1,048,576 UTF-16 code units per field, 256 retained distinct values per column; a saturated distinct count is marked as a lower bound. Blank records are skipped. Missing fields count as missing, extra fields are reported as ragged. CSV uses comma separators, doubled quotes, CRLF/LF, and multiline fields. Date inference requires valid ISO calendar dates. Leading-zero numbers remain strings. Mixed-type columns are reported, not silently coerced. No full-file duplicate-row check is claimed.

MIT license. Created by Rishit Pradhan with AI-assisted implementation.
