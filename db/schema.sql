CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS platforms (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    creator_count BIGINT NOT NULL DEFAULT 0 CHECK (creator_count >= 0)
);

INSERT INTO platforms (slug, name) VALUES
    ('instagram', 'Instagram'),
    ('youtube', 'YouTube'),
    ('tiktok', 'TikTok'),
    ('twitch', 'Twitch'),
    ('podcast', 'Podcast'),
    ('linkedin', 'LinkedIn')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, is_active = TRUE;

CREATE TABLE IF NOT EXISTS creators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 40),
    handle TEXT NOT NULL CHECK (char_length(handle) BETWEEN 2 AND 41),
    niche TEXT NOT NULL CHECK (niche IN (
        'Beauty', 'Food', 'Fitness', 'Lifestyle', 'Travel',
        'Fashion', 'Tech', 'Gaming', 'Wellness', 'Education'
    )),
    audience_size TEXT NOT NULL CHECK (audience_size IN ('nano', 'micro', 'mid', 'large')),
    followers INTEGER NOT NULL CHECK (followers BETWEEN 1000 AND 10000000),
    content_style TEXT NOT NULL CHECK (content_style IN (
        'Cinematic', 'Educational', 'Funny & casual', 'Storytelling',
        'Minimalist', 'High-energy', 'Behind the scenes', 'Reviews & unboxings'
    )),
    bio TEXT NOT NULL CHECK (char_length(bio) BETWEEN 1 AND 140),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS creators_handle_unique
    ON creators (LOWER(handle));
CREATE INDEX IF NOT EXISTS creators_discovery_idx
    ON creators (niche, audience_size, content_style, created_at DESC);
CREATE INDEX IF NOT EXISTS creators_search_trgm_idx
    ON creators USING GIN ((name || ' ' || handle || ' ' || niche || ' ' || content_style || ' ' || bio) gin_trgm_ops);

CREATE TABLE IF NOT EXISTS creator_platforms (
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    platform_slug TEXT NOT NULL REFERENCES platforms(slug),
    PRIMARY KEY (creator_id, platform_slug)
);
CREATE INDEX IF NOT EXISTS creator_platforms_platform_idx
    ON creator_platforms (platform_slug, creator_id);

CREATE TABLE IF NOT EXISTS collaboration_introductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    request_key UUID NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS collaboration_introductions_created_idx
    ON collaboration_introductions (created_at DESC);

CREATE TABLE IF NOT EXISTS community_stats (
    id SMALLINT PRIMARY KEY CHECK (id = 1),
    creator_count BIGINT NOT NULL DEFAULT 0 CHECK (creator_count >= 0),
    introduction_count BIGINT NOT NULL DEFAULT 0 CHECK (introduction_count >= 0)
);

INSERT INTO community_stats (id, creator_count, introduction_count)
VALUES (
    1,
    (SELECT COUNT(*) FROM creators),
    (SELECT COUNT(*) FROM collaboration_introductions)
)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION collabify_update_creator_count() RETURNS TRIGGER AS $$
BEGIN
    UPDATE community_stats
       SET creator_count = creator_count + CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE -1 END
     WHERE id = 1;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS creators_update_community_count ON creators;
CREATE TRIGGER creators_update_community_count
AFTER INSERT OR DELETE ON creators
FOR EACH ROW EXECUTE FUNCTION collabify_update_creator_count();

CREATE OR REPLACE FUNCTION collabify_update_introduction_count() RETURNS TRIGGER AS $$
BEGIN
    UPDATE community_stats
       SET introduction_count = introduction_count + CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE -1 END
     WHERE id = 1;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS introductions_update_community_count ON collaboration_introductions;
CREATE TRIGGER introductions_update_community_count
AFTER INSERT OR DELETE ON collaboration_introductions
FOR EACH ROW EXECUTE FUNCTION collabify_update_introduction_count();

CREATE OR REPLACE FUNCTION collabify_update_platform_count() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE platforms SET creator_count = creator_count + 1 WHERE slug = NEW.platform_slug;
    ELSE
        UPDATE platforms SET creator_count = creator_count - 1 WHERE slug = OLD.platform_slug;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS creator_platforms_update_count ON creator_platforms;
CREATE TRIGGER creator_platforms_update_count
AFTER INSERT OR DELETE ON creator_platforms
FOR EACH ROW EXECUTE FUNCTION collabify_update_platform_count();
