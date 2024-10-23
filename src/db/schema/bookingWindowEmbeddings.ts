import { nanoid } from '@/lib/utils';
import { index, pgTable, text, varchar, vector } from 'drizzle-orm/pg-core';

import { bookingWindows } from './bookingWindows';

export const bookingWindowEmbeddings = pgTable(
  'booking_window_embeddings',
  {
    id: varchar('id', { length: 191 })
        .primaryKey()
        .$defaultFn(() => nanoid()),
    bookingWindowId: varchar('booking_window_id', { length: 191 }).references(
      () => bookingWindows.id,
      { onDelete: 'cascade' },
    ),
    content: text('content').notNull(),
    embedding: vector('embedding', { dimensions: 768 }).notNull(),
  },
  (table) => ({
    embeddingIndex: index('embedding_index').using(
        'hnsw',
        table.embedding.op('vector_cosine_ops')
    ),
  }),
);