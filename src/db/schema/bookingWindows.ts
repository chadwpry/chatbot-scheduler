import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const bookingWindows = pgTable('booking_windows', {
  id: varchar('id', { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  startDateTime: timestamp('start_date_time').notNull(),
  endDateTime: timestamp('end_date_time').notNull(),
  weekDay: varchar('week_day', { length: 9 }).notNull(),
  availabilityStatus: varchar('availability_status', { length: 20 }).default("available").notNull(),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertBookingWindowSchema = createInsertSchema(bookingWindows)
  .extend({})
  .omit({ id: true, createdAt: true, updatedAt: true });
export const fullBookingWindowSchema = createInsertSchema(bookingWindows);

export type NewBookingWindowParams = z.infer<typeof insertBookingWindowSchema>;
export type FullBookingWindowParams = z.infer<typeof fullBookingWindowSchema>;