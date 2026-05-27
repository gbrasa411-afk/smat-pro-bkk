import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const notificationTypeEnum = pgEnum('notification_type', [
  'INFO',
  'WARNING',
  'DANGER',
  'SUCCESS',
]);

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  message: text('message').notNull(),
  type: notificationTypeEnum('type').notNull().default('INFO'),
  isRead: boolean('is_read').notNull().default(false),
  link: varchar('link', { length: 500 }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
