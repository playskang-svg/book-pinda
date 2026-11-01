import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`books\` ADD \`coupang_url\` text;`)
  await db.run(sql`ALTER TABLE \`books\` ADD \`coverage\` text;`)
  await db.run(sql`ALTER TABLE \`books\` ADD \`body\` text;`)
  await db.run(sql`ALTER TABLE \`books\` ADD \`ending\` text;`)
  await db.run(sql`ALTER TABLE \`books\` ADD \`only_in_book\` text;`)
  await db.run(sql`ALTER TABLE \`_books_v\` ADD \`version_coupang_url\` text;`)
  await db.run(sql`ALTER TABLE \`_books_v\` ADD \`version_coverage\` text;`)
  await db.run(sql`ALTER TABLE \`_books_v\` ADD \`version_body\` text;`)
  await db.run(sql`ALTER TABLE \`_books_v\` ADD \`version_ending\` text;`)
  await db.run(sql`ALTER TABLE \`_books_v\` ADD \`version_only_in_book\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`books\` DROP COLUMN \`coupang_url\`;`)
  await db.run(sql`ALTER TABLE \`books\` DROP COLUMN \`coverage\`;`)
  await db.run(sql`ALTER TABLE \`books\` DROP COLUMN \`body\`;`)
  await db.run(sql`ALTER TABLE \`books\` DROP COLUMN \`ending\`;`)
  await db.run(sql`ALTER TABLE \`books\` DROP COLUMN \`only_in_book\`;`)
  await db.run(sql`ALTER TABLE \`_books_v\` DROP COLUMN \`version_coupang_url\`;`)
  await db.run(sql`ALTER TABLE \`_books_v\` DROP COLUMN \`version_coverage\`;`)
  await db.run(sql`ALTER TABLE \`_books_v\` DROP COLUMN \`version_body\`;`)
  await db.run(sql`ALTER TABLE \`_books_v\` DROP COLUMN \`version_ending\`;`)
  await db.run(sql`ALTER TABLE \`_books_v\` DROP COLUMN \`version_only_in_book\`;`)
}
