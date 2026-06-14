CREATE TABLE IF NOT EXISTS listing (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255),
    address VARCHAR(255),
    price NUMERIC,
    area VARCHAR(255),
    description VARCHAR(2000),
    phone VARCHAR(255),
    email VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(255) DEFAULT 'available',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS listing_photos (
    listing_id BIGINT NOT NULL REFERENCES listing(id) ON DELETE CASCADE,
    photo VARCHAR(255) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (listing_id, photo)
);

CREATE TABLE IF NOT EXISTS listing_docs (
    listing_id BIGINT NOT NULL REFERENCES listing(id) ON DELETE CASCADE,
    doc VARCHAR(255) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (listing_id, doc)
);

CREATE INDEX IF NOT EXISTS idx_listing_created_at ON listing(created_at);
CREATE INDEX IF NOT EXISTS idx_listing_photos_listing_id ON listing_photos(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_docs_listing_id ON listing_docs(listing_id);
