import { bookingWindows as bookingWindowsTable, bookingWindowEmbeddings as bookingWindowEmbeddingsTable, insertBookingWindowSchema } from "@/db/schema";
import { db } from "@/db";
import { generateBookingWindowEmbedding } from "@/ai/bookingWindows";

const seedData = require("@/db/seed.json");

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  for (const data of seedData) {
    const item = insertBookingWindowSchema.parse({
        ...data,
        startDateTime: new Date(data.startDateTime),
        endDateTime: new Date(data.endDateTime),
    })

    const [bookingWindowResult] = await db
      .insert(bookingWindowsTable)
      .values(item)
      .returning();

    const openaiEmbeddings = await generateBookingWindowEmbedding(bookingWindowResult);

    const [bookingWindowEmbedding] = await db
      .insert(bookingWindowEmbeddingsTable)
      .values({
        ...openaiEmbeddings,
        bookingWindowId: bookingWindowResult.id,
      })
      .returning();

    console.log(`Inserted booking window: ${bookingWindowResult.id} with embedding: ${bookingWindowEmbedding.id}`);

    sleep(1000);
  }

  console.log('Done seeding database');

  process.exit(0);
}

main().catch((err) => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
