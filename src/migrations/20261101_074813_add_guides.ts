import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`guides_picks\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`book_id\` integer NOT NULL,
  	\`why\` text NOT NULL,
  	\`imagine\` text NOT NULL,
  	FOREIGN KEY (\`book_id\`) REFERENCES \`books\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`guides\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`guides_picks_order_idx\` ON \`guides_picks\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`guides_picks_parent_id_idx\` ON \`guides_picks\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`guides_picks_book_idx\` ON \`guides_picks\` (\`book_id\`);`)
  await db.run(sql`CREATE TABLE \`guides\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`group\` text NOT NULL,
  	\`chip\` text NOT NULL,
  	\`order\` numeric DEFAULT 100,
  	\`photo\` text NOT NULL,
  	\`photo_alt\` text NOT NULL,
  	\`og_url\` text,
  	\`sns_hook\` text NOT NULL,
  	\`lede\` text NOT NULL,
  	\`loss\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`guides_slug_idx\` ON \`guides\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`guides_updated_at_idx\` ON \`guides\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`guides_created_at_idx\` ON \`guides\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`exam_guides_books\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`short_title\` text NOT NULL,
  	\`publisher\` text NOT NULL,
  	\`published_on\` text NOT NULL,
  	\`pages\` numeric NOT NULL,
  	\`sales\` numeric,
  	\`list_price\` numeric NOT NULL,
  	\`sale_price\` numeric NOT NULL,
  	\`points\` numeric DEFAULT 0,
  	\`cover_url\` text NOT NULL,
  	\`makeup\` text NOT NULL,
  	\`best_for\` text NOT NULL,
  	\`caution\` text NOT NULL,
  	\`imagine\` text NOT NULL,
  	\`kyobo_url\` text,
  	\`yes24_url\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`exam_guides\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`exam_guides_books_order_idx\` ON \`exam_guides_books\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`exam_guides_books_parent_id_idx\` ON \`exam_guides_books\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`exam_guides_verdicts\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`who\` text NOT NULL,
  	\`pick\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`exam_guides\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`exam_guides_verdicts_order_idx\` ON \`exam_guides_verdicts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`exam_guides_verdicts_parent_id_idx\` ON \`exam_guides_verdicts\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`exam_guides\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`exam\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`order\` numeric DEFAULT 100,
  	\`verified_at\` text NOT NULL,
  	\`og_url\` text,
  	\`sns_hook\` text NOT NULL,
  	\`lede\` text NOT NULL,
  	\`notice\` text NOT NULL,
  	\`loss\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`exam_guides_slug_idx\` ON \`exam_guides\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`exam_guides_updated_at_idx\` ON \`exam_guides\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`exam_guides_created_at_idx\` ON \`exam_guides\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`books\` ADD \`imagine\` text;`)
  await db.run(sql`ALTER TABLE \`books\` ADD \`loss_note\` text;`)
  await db.run(sql`ALTER TABLE \`books\` ADD \`sns_hook\` text;`)
  await db.run(sql`ALTER TABLE \`_books_v\` ADD \`version_imagine\` text;`)
  await db.run(sql`ALTER TABLE \`_books_v\` ADD \`version_loss_note\` text;`)
  await db.run(sql`ALTER TABLE \`_books_v\` ADD \`version_sns_hook\` text;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`guides_id\` integer REFERENCES guides(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`exam_guides_id\` integer REFERENCES exam_guides(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_guides_id_idx\` ON \`payload_locked_documents_rels\` (\`guides_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_exam_guides_id_idx\` ON \`payload_locked_documents_rels\` (\`exam_guides_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`guides_picks\`;`)
  await db.run(sql`DROP TABLE \`guides\`;`)
  await db.run(sql`DROP TABLE \`exam_guides_books\`;`)
  await db.run(sql`DROP TABLE \`exam_guides_verdicts\`;`)
  await db.run(sql`DROP TABLE \`exam_guides\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`books_id\` integer,
  	\`pages_id\` integer,
  	\`categories_id\` integer,
  	\`media_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`books_id\`) REFERENCES \`books\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "books_id", "pages_id", "categories_id", "media_id", "users_id") SELECT "id", "order", "parent_id", "path", "books_id", "pages_id", "categories_id", "media_id", "users_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_books_id_idx\` ON \`payload_locked_documents_rels\` (\`books_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`ALTER TABLE \`books\` DROP COLUMN \`imagine\`;`)
  await db.run(sql`ALTER TABLE \`books\` DROP COLUMN \`loss_note\`;`)
  await db.run(sql`ALTER TABLE \`books\` DROP COLUMN \`sns_hook\`;`)
  await db.run(sql`ALTER TABLE \`_books_v\` DROP COLUMN \`version_imagine\`;`)
  await db.run(sql`ALTER TABLE \`_books_v\` DROP COLUMN \`version_loss_note\`;`)
  await db.run(sql`ALTER TABLE \`_books_v\` DROP COLUMN \`version_sns_hook\`;`)
}
