# Collabify

Collabify is a responsive creator discovery app with creator accounts, a searchable directory, saved creators, and private in-app conversations backed by PostgreSQL.

## Run locally (Windows)

Requirements: Node.js 22.9 or newer and Docker Desktop with Docker Compose.

1. Copy `.env.example` to `.env`. The sample credentials are for local development only.
2. Start PostgreSQL: `docker compose up -d db`
3. Install dependencies: `npm install`
4. Start Collabify: `npm start`
5. Open [http://localhost:3000](http://localhost:3000)

On startup, the app creates or updates the schema and supported-platform catalog. PostgreSQL stores creator accounts and profiles, saved creators, introductions, expiring sign-in sessions, and conversations. Sessions use HTTP-only, same-site cookies; passwords are salted and hashed with scrypt. Community stats poll the API every 15 seconds, and the directory refreshes every 30 seconds.

Open Collabify at `http://localhost:3000`, served by `npm start`. Do not open `index.html` directly or use a static-only preview: registration requires the `/api` endpoints. If a preview proxy returns plain-text `Forbidden`, the form now shows this setup guidance instead of a JSON parse error.

To connect a hosted PostgreSQL instance, set `DATABASE_URL` to its connection string and start with `npm start`. If the provider requires TLS, configure `PGSSLMODE=require`; use a trusted CA rather than disabling certificate validation.

## Data model

- `creators`: public creator profile and audience/niche/style attributes.
- `creator_accounts` and `account_sessions`: email/password accounts and hashed, expiring sessions.
- `creators.profile_links`: validated public portfolio, GitHub, website, and social-account URLs that creators manage from My Profile.
- `creators.avatar_image` and `avatar_mime_type`: optional JPEG, PNG, or WebP profile photos, limited to 2 MB and served from the creator avatar endpoint.
- `platforms`: supported platform catalog.
- `creator_platforms`: many-to-many creator/platform memberships.
- `saved_creators`: account-specific saved profiles.
- `conversations` and `conversation_messages`: private messages between two registered creators.
- `collaboration_introductions`: idempotently recorded introductions to registered creators.

The schema includes foreign keys, input constraints, discovery indexes, a trigram search index, transaction-maintained community/platform counters, and a durable Docker volume for local development.

## Community stats

- **Registered creators** counts profiles stored in PostgreSQL. The curated example cards in the discovery feed are demonstrations and are not included.
- **Intros sent** counts introductions explicitly recorded with “I sent this intro”; merely copying a draft does not change it.
- **Social platforms covered** counts enabled platform types in the PostgreSQL catalog, not the number of creators on those platforms.

## Account and messaging notes

- Create an account with an email address, a creator profile, and a password of at least 12 characters. Sign in on another browser to access your saved creators and conversations.
- In-app messages can only be sent between registered creator accounts. The curated example cards in Discover are previews and cannot receive Collabify messages.
- Conversation history is retained in PostgreSQL. Message delivery is not real-time; open conversations refresh periodically.
- For a public deployment, configure HTTPS (which enables secure session cookies), email verification and password recovery, abuse reporting/moderation, and managed-database backups. Collabify does not send messages through external social platforms.
