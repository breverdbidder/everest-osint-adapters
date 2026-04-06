# CLAUDE.md — Everest OSINT Adapters

## Purpose
Real estate OSINT adapter modules following SpiderFoot publisher/subscriber pattern.

## Architecture
- `adapters/base.py` — BaseOSINTAdapter + OSINTEvent classes
- `adapters/*.py` — One file per data source adapter
- `tests/` — One test per adapter
- `docs/` — Adapter documentation

## Rules
- Every adapter extends BaseOSINTAdapter
- Every adapter implements: produced_events(), fetch(), normalize()
- Every event gets a dedup_hash (SHA256)
- Confidence scoring 0-100 on every event
- One test file per adapter minimum

## Supabase
- Project: mocerqjnksmhcjzxrewo
- Tables: osint_sources, osint_events, osint_correlations, osint_snapshots, osint_scores

## House Brand
- Navy #1E3A5F, Orange #F59E0B, Inter font, bg #020617
