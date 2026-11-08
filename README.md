# Collabify

Collabify is a responsive creator discovery app with a Node.js API and PostgreSQL as the shared source of truth for registered profiles and recorded introductions.

## Run locally (Windows)

Requirements: Node.js 22.9 or newer and Docker Desktop with Docker Compose.

1. Copy `.env.example` to `.env`. The sample credentials are for local development only.
2. Start PostgreSQL: `docker compose up -d db`
3. Install dependencies: `npm install`
4. Start Collabify: `npm start`
5. Open [http://localhost:3000](http://localhost:3000)

On startup, the app creates the schema and supported-platform catalog if they do not already exist. PostgreSQL stores creator profiles, their platform memberships, and introductions; browser storage only remembers saved cards and the local active profile. Community stats poll the API every 15 seconds, and the directory refreshes every 30 seconds.

Open Collabify at `http://localhost:3000`, served by `npm start`. Do not open `index.html` directly or use a static-only preview: registration requires the `/api` endpoints. If a preview proxy returns plain-text `Forbidden`, the form now shows this setup guidance instead of a JSON parse error.

To connect a hosted PostgreSQL instance, set `DATABASE_URL` to its connection string and start with `npm start`. If the provider requires TLS, configure `PGSSLMODE=require`; use a trusted CA rather than disabling certificate validation.

## Data model

- `creators`: public creator profile and audience/niche/style attributes.
- `platforms`: supported platform catalog.
- `creator_platforms`: many-to-many creator/platform memberships.
- `collaboration_introductions`: idempotently recorded introductions to registered creators.

The schema includes foreign keys, input constraints, discovery indexes, a trigram search index, transaction-maintained community/platform counters, and a durable Docker volume for local development.

## Community stats

- **Registered creators** counts profiles stored in PostgreSQL. The curated example cards in the discovery feed are demonstrations and are not included.
- **Intros sent** counts introductions explicitly recorded with “I sent this intro”; merely copying a draft does not change it.
- **Social platforms covered** counts enabled platform types in the PostgreSQL catalog, not the number of creators on those platforms.

## Important limitations

This is a backend-enabled MVP, not yet a production account system. Registration and introduction endpoints are public and rate-limited, but users are not authenticated and an introduction record is a user-reported action—not proof that a recipient received or accepted a message. Before a public launch, add verified authentication, creator ownership checks, abuse reporting/moderation, and managed-database backups. Social messaging is not sent by Collabify.
