CREATE TABLE "admin_login_failures" (
	"id" serial PRIMARY KEY,
	"ip" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_sessions" (
	"token_hash" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_events" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"rules" jsonb DEFAULT '[]' NOT NULL,
	"mode" text NOT NULL,
	"subject" text DEFAULT 'gk' NOT NULL,
	"reward_multiplier" integer DEFAULT 2 NOT NULL,
	"ends_at" timestamp NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_questions" (
	"id" serial PRIMARY KEY,
	"subject" text NOT NULL,
	"level" integer,
	"prompt" text NOT NULL,
	"options" jsonb NOT NULL,
	"answer" integer NOT NULL,
	"difficulty" integer DEFAULT 1 NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"handle" text NOT NULL,
	"avatar" text DEFAULT '🐝' NOT NULL,
	"email" text,
	"is_guest" boolean DEFAULT true NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	"losses" integer DEFAULT 0 NOT NULL,
	"streak" integer DEFAULT 0 NOT NULL,
	"stars" integer DEFAULT 0 NOT NULL,
	"levels_cleared" integer DEFAULT 0 NOT NULL,
	"pending_points" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "admin_login_failures_ip_idx" ON "admin_login_failures" ("ip","created_at");--> statement-breakpoint
CREATE INDEX "custom_questions_subject_idx" ON "custom_questions" ("subject","level");