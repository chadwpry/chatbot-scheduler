import { env } from "@/lib/env.mjs";
import { embed } from "ai";
import { createOllama } from "ollama-ai-provider";
import { cosineDistance, eq, sql } from "drizzle-orm";
import { format } from "date-fns";

import { db } from "@/db";
import { FullBookingWindowParams } from "@/db/schema";
import { bookingWindows, bookingWindowEmbeddings } from "@/db/schema";
import { sendMessage } from "@/lib/notifierService";

const ollama = createOllama({ baseURL: env.OLLAMA_BASE_URL });

const embeddingModel = ollama.textEmbeddingModel("nomic-embed-text");

export const generateBookingWindowEmbedding = async (bookingWindow: FullBookingWindowParams): Promise<{embedding: number[], content: string}> => {
    const input = `
        start date: ${bookingWindow.startDateTime}
        end date: ${bookingWindow.endDateTime}
        weekday name: ${bookingWindow.weekDay}
        availability: ${bookingWindow.availabilityStatus}`;

    const { embedding } = await embed({
        model: embeddingModel,
        value: input,
    })

    return { embedding, content: input };
}

const generateQueryEmbedding = async (input: string): Promise<number[]> => {
    const value = input.replaceAll("\n", " ");
    const { embedding } = await embed({
        model: embeddingModel,
        value,
    })
    return embedding;
}

export const findBookingWindows = async (query: string) => {
    const queryEmbedded = await generateQueryEmbedding(query);
    const similarity = sql<number>`1 - (${cosineDistance(
        bookingWindowEmbeddings.embedding,
        queryEmbedded,
    )})`;

    const bookingWindowsEmbbeddings = await db
        .select({
            id: bookingWindows.id,
            startDateTime: bookingWindows.startDateTime,
            endDateTime: bookingWindows.endDateTime,
            weekday: bookingWindows.weekDay,
            content: bookingWindowEmbeddings.content,
            similarity
        })
        .from(bookingWindowEmbeddings)
        .leftJoin(bookingWindows, eq(bookingWindowEmbeddings.bookingWindowId, bookingWindows.id))
        .where(sql`${similarity} > 0.5 and booking_windows.availability_status = 'available'`)
        .orderBy(sql`${similarity} desc`)
        .limit(5);

    return bookingWindowsEmbbeddings;
}

export const scheduleBooking = async (bookingWindowId: string) => {
    const bookingWindow = await db.select().from(bookingWindows).where(eq(bookingWindows.id, bookingWindowId));

    await db
        .update(bookingWindows)
        .set({ availabilityStatus: "reserved" })
        .where(eq(bookingWindows.id, bookingWindowId));

    await sendMessage(`Booking scheduled successfully!
    booked at: ${format(new Date(), "yyyy-MM-dd HH:mm:ss")}
    booking window:
        id: ${bookingWindow[0].id}
        weekday: ${bookingWindow[0].weekDay}
        start: ${format(bookingWindow[0].startDateTime, "yyyy-MM-dd HH:mm:ss")}
        end: ${format(bookingWindow[0].endDateTime, "yyyy-MM-dd HH:mm:ss")}`)

    return bookingWindow[0];
}