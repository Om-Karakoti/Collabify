-- pg_trgm powers the trigram search index. It is optional: if the database user
-- cannot install extensions, search still works through a sequential scan.
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
EXCEPTION
    WHEN insufficient_privilege OR feature_not_supported OR undefined_file THEN
        RAISE NOTICE 'pg_trgm is unavailable; continuing without the trigram search index.';
END
$$;

-- gen_random_uuid() is built into PostgreSQL 13+; pgcrypto supplies it on older servers.
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
EXCEPTION
    WHEN insufficient_privilege OR feature_not_supported OR undefined_file THEN
        RAISE NOTICE 'pgcrypto is unavailable; relying on built-in gen_random_uuid().';
END
$$;

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
    profile_links JSONB NOT NULL DEFAULT '[]'::JSONB CHECK (jsonb_typeof(profile_links) = 'array'),
    avatar_image BYTEA,
    avatar_mime_type TEXT CHECK (avatar_mime_type IN ('image/jpeg', 'image/png', 'image/webp')),
    CHECK ((avatar_image IS NULL) = (avatar_mime_type IS NULL)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE creators
    ADD COLUMN IF NOT EXISTS profile_links JSONB NOT NULL DEFAULT '[]'::JSONB;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS avatar_image BYTEA;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS avatar_mime_type TEXT;

CREATE TABLE IF NOT EXISTS creator_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    creator_id UUID UNIQUE REFERENCES creators(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE creators
    ADD COLUMN IF NOT EXISTS account_id UUID UNIQUE REFERENCES creator_accounts(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS account_sessions (
    token_hash TEXT PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES creator_accounts(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS account_sessions_expiry_idx ON account_sessions (expires_at);

CREATE TABLE IF NOT EXISTS saved_creators (
    account_id UUID NOT NULL REFERENCES creator_accounts(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (account_id, creator_id)
);

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_a_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    creator_b_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (creator_a_id < creator_b_id),
    UNIQUE (creator_a_id, creator_b_id)
);

CREATE TABLE IF NOT EXISTS conversation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS conversation_messages_timeline_idx
    ON conversation_messages (conversation_id, created_at, id);

CREATE UNIQUE INDEX IF NOT EXISTS creators_handle_unique
    ON creators (LOWER(handle));
CREATE INDEX IF NOT EXISTS creators_discovery_idx
    ON creators (niche, audience_size, content_style, created_at DESC);
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
        EXECUTE $index$CREATE INDEX IF NOT EXISTS creators_search_trgm_idx
            ON creators USING GIN ((name || ' ' || handle || ' ' || niche || ' ' || content_style || ' ' || bio) gin_trgm_ops)$index$;
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS creator_platforms (
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    platform_slug TEXT NOT NULL REFERENCES platforms(slug),
    PRIMARY KEY (creator_id, platform_slug)
);
CREATE INDEX IF NOT EXISTS creator_platforms_platform_idx
    ON creator_platforms (platform_slug, creator_id);

CREATE TABLE IF NOT EXISTS collaboration_introductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
    recipient_creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    request_key UUID NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE collaboration_introductions
    ADD COLUMN IF NOT EXISTS sender_creator_id UUID REFERENCES creators(id) ON DELETE CASCADE;
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
