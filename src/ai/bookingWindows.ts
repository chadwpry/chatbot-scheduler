import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { FullBookingWindowParams } from "@/db/schema";


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