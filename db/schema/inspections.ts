import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { assets } from './assets';
import { users } from './users';

export const inspectionStatusEnum = pgEnum('inspection_status', [
  'Normal',
  'Perlu Perbaikan',
  'Rusak Berat',
]);

/**
 * Represents a single checklist item result in an inspection.
 */
export interface ChecklistItemResult {
  label: string;
  category: string;
  result: 'pass' | 'fail' | 'na';
  notes?: string;
}

export const inspections = pgTable('inspections', {
  id: uuid('id').primaryKey().defaultRandom(),
  assetId: varchar('asset_id', { length: 20 })
    .notNull()
    .references(() => assets.id, { onDelete: 'restrict' }),
  inspectorId: uuid('inspector_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  inspectorName: varchar('inspector_name', { length: 100 }).notNull(),
  status: inspectionStatusEnum('status').notNull(),
  checklistResults: jsonb('checklist_results')
    .$type<ChecklistItemResult[]>()
    .notNull(),
  notes: text('notes'),
  photoUrl: text('photo_url'),
  signatureUrl: text('signature_url'),
  gpsCoordinates: varchar('gps_coordinates', { length: 100 }),
  nextInspectionDate: timestamp('next_inspection_date', {
    withTimezone: true,
  }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Inspection = typeof inspections.$inferSelect;
export type NewInspection = typeof inspections.$inferInsert;
