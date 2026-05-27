import { relations } from 'drizzle-orm';
import { users } from './users';
import { categories, assetTypes, assets } from './assets';
import { inspections } from './inspections';
import { checklistTemplates } from './checklists';
import { vehicleServices } from './services';
import { notifications } from './notifications';

// ─── User Relations ──────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  inspections: many(inspections),
  notifications: many(notifications),
  inspectedAssets: many(assets, { relationName: 'lastInspector' }),
  vehicleServices: many(vehicleServices),
}));

// ─── Category Relations ──────────────────────────────────────────────────────

export const categoriesRelations = relations(categories, ({ many }) => ({
  assetTypes: many(assetTypes),
  assets: many(assets),
}));

// ─── Asset Type Relations ────────────────────────────────────────────────────

export const assetTypesRelations = relations(assetTypes, ({ one, many }) => ({
  category: one(categories, {
    fields: [assetTypes.categoryId],
    references: [categories.id],
  }),
  assets: many(assets),
  checklistTemplates: many(checklistTemplates),
}));

// ─── Asset Relations ─────────────────────────────────────────────────────────

export const assetsRelations = relations(assets, ({ one, many }) => ({
  category: one(categories, {
    fields: [assets.categoryId],
    references: [categories.id],
  }),
  assetType: one(assetTypes, {
    fields: [assets.assetTypeId],
    references: [assetTypes.id],
  }),
  lastInspector: one(users, {
    fields: [assets.lastInspectedBy],
    references: [users.id],
    relationName: 'lastInspector',
  }),
  inspections: many(inspections),
  vehicleServices: many(vehicleServices),
}));

// ─── Inspection Relations ────────────────────────────────────────────────────

export const inspectionsRelations = relations(inspections, ({ one }) => ({
  asset: one(assets, {
    fields: [inspections.assetId],
    references: [assets.id],
  }),
  inspector: one(users, {
    fields: [inspections.inspectorId],
    references: [users.id],
  }),
}));

// ─── Checklist Template Relations ────────────────────────────────────────────

export const checklistTemplatesRelations = relations(
  checklistTemplates,
  ({ one }) => ({
    assetType: one(assetTypes, {
      fields: [checklistTemplates.assetTypeId],
      references: [assetTypes.id],
    }),
  })
);

// ─── Vehicle Service Relations ───────────────────────────────────────────────

export const vehicleServicesRelations = relations(
  vehicleServices,
  ({ one }) => ({
    asset: one(assets, {
      fields: [vehicleServices.assetId],
      references: [assets.id],
    }),
    performer: one(users, {
      fields: [vehicleServices.performedBy],
      references: [users.id],
    }),
  })
);

// ─── Notification Relations ──────────────────────────────────────────────────

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
