CREATE TABLE IF NOT EXISTS listing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    address TEXT,
    price TEXT,
    area TEXT,
    description TEXT,
    phone TEXT,
    email TEXT,
    latitude REAL,
    longitude REAL,
    status TEXT DEFAULT 'available',
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS listing_photos (
    listing_id INTEGER NOT NULL,
    photo TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (listing_id, photo),
    FOREIGN KEY (listing_id) REFERENCES listing(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS listing_docs (
    listing_id INTEGER NOT NULL,
    doc TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (listing_id, doc),
    FOREIGN KEY (listing_id) REFERENCES listing(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_listing_created_at ON listing(created_at);
CREATE INDEX IF NOT EXISTS idx_listing_photos_listing_id ON listing_photos(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_docs_listing_id ON listing_docs(listing_id);
