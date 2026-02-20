from __future__ import annotations

from prometheus_client import Counter, Gauge, Histogram


hh_sync_runs_total = Counter(
    "hh_sync_runs_total",
    "HH negotiations sync runs",
    labelnames=("status",),
)

hh_sync_updated_total = Counter(
    "hh_sync_updated_total",
    "HH negotiations sync updated applications total",
)

hh_sync_errors_total = Counter(
    "hh_sync_errors_total",
    "HH negotiations sync errors total",
    labelnames=("code",),
)

hh_sync_duration_seconds = Histogram(
    "hh_sync_duration_seconds",
    "HH negotiations sync duration in seconds",
    buckets=(0.1, 0.25, 0.5, 1, 2, 5, 10, 20),
)

hh_unauthorized_accounts_total = Gauge(
    "hh_unauthorized_accounts_total",
    "Number of HH accounts requiring reauth",
)

