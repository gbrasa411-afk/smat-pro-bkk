import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).unique().notNull(),
  icon: varchar('icon', { length: 50 }),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const assetTypes = pgTable('asset_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  icon: varchar('icon', { length: 50 }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const assets = pgTable('assets', {
  id: varchar('id', { length: 20 }).primaryKey(), // Custom ID like 'MOB-001'
  name: varchar('name', { length: 200 }).notNull(),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'restrict' }),
  assetTypeId: uuid('asset_type_id')
    .notNull()
    .references(() => assetTypes.id, { onDelete: 'restrict' }),
  location: varchar('location', { length: 200 }),
  plateNumber: varchar('plate_number', { length: 20 }), // No. Polisi for vehicles
  lastStatus: varchar('last_status', { length: 50 })
    .notNull()
    .default('Belum Diinspeksi'),
  lastInspectedAt: timestamp('last_inspected_at', { withTimezone: true }),
  lastInspectedBy: uuid('last_inspected_by').references(() => users.id, {
    onDelete: 'set null',
  }),
  nextInspectionDue: timestamp('next_inspection_due', { withTimezone: true }),
  photoUrl: text('photo_url'),
  qrCode: text('qr_code'),
  notes: text('notes'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type AssetType = typeof assetTypes.$inferSelect;
export type NewAssetType = typeof assetTypes.$inferInsert;

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
