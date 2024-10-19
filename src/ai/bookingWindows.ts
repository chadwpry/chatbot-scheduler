import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { db } from "@/db";
import { FullBookingWindowParams } from "@/db/schema";
import { cosineDistance, eq, sql } from "drizzle-orm";
import { bookingWindows, bookingWindowEmbeddings } from "@/db/schema";

const embeddingModel = openai.embedding("text-embedding-ada-002");

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
        .select({ name: bookingWindowEmbeddings.content, similarity})
        .from(bookingWindowEmbeddings)
        .leftJoin(bookingWindows, eq(bookingWindowEmbeddings.bookingWindowId, bookingWindows.id))
        .where(sql`${similarity} > 0.5 and booking_windows.availability_status = 'available'`)
        .orderBy(sql`${similarity} desc`)
        .limit(5);

    return bookingWindowsEmbbeddings;
}