CREATE TABLE IF NOT EXISTS urls (
    code TEXT PRIMARY KEY,
    long_url TEXT NOT NULL,
    clicks INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (clicks >= 0),
    CHECK (code ~ '^[0-9A-Za-z]+$')
);