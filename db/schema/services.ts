import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  numeric,
} from 'drizzle-orm/pg-core';
import { assets } from './assets';
import { users } from './users';

export const vehicleServices = pgTable('vehicle_services', {
  id: uuid('id').primaryKey().defaultRandom(),
  assetId: varchar('asset_id', { length: 20 })
    .notNull()
    .references(() => assets.id, { onDelete: 'restrict' }),
  serviceDate: timestamp('service_date', { withTimezone: true }).notNull(),
  serviceType: varchar('service_type', { length: 100 }).notNull(),
  description: text('description'),
  partsReplaced: text('parts_replaced'),
  cost: numeric('cost', { precision: 12, scale: 2 }),
  nextServiceDate: timestamp('next_service_date', { withTimezone: true }),
  nextServiceType: varchar('next_service_type', { length: 100 }),
  workshopName: varchar('workshop_name', { length: 200 }),
  mileage: integer('mileage'),
  performedBy: uuid('performed_by').references(() => users.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type VehicleService = typeof vehicleServices.$inferSelect;
export type NewVehicleService = typeof vehicleServices.$inferInsert;
