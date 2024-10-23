CREATE TABLE IF NOT EXISTS "booking_window_embeddings" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"booking_window_id" varchar(191),
	"content" text NOT NULL,
	"embedding" vector(768) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "booking_windows" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"start_date_time" timestamp NOT NULL,
	"end_date_time" timestamp NOT NULL,
	"week_day" varchar(9) NOT NULL,
	"availability_status" varchar(20) DEFAULT 'available' NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booking_window_embeddings" ADD CONSTRAINT "booking_window_embeddings_booking_window_id_booking_windows_id_fk" FOREIGN KEY ("booking_window_id") REFERENCES "public"."booking_windows"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "embedding_index" ON "booking_window_embeddings" USING hnsw ("embedding" vector_cosine_ops);