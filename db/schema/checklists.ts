import {
  pgTable,
  uuid,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { assetTypes } from './assets';

/**
 * Represents a single item in a checklist template.
 */
export interface ChecklistTemplateItem {
  label: string;
  category: string;
}

export const checklistTemplates = pgTable('checklist_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  assetTypeId: uuid('asset_type_id')
    .notNull()
    .references(() => assetTypes.id, { onDelete: 'cascade' }),
  items: jsonb('items').$type<ChecklistTemplateItem[]>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ChecklistTemplate = typeof checklistTemplates.$inferSelect;
export type NewChecklistTemplate = typeof checklistTemplates.$inferInsert;
