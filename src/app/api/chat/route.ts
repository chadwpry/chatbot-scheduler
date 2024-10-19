import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText, tool } from "ai";
import { z } from "zod";
import { findBookingWindows } from "@/ai/bookingWindows";

export const maxDuration = 300;

export async function POST(request: Request) {
    const { messages } = await request.json();

    const result = await streamText({
        model: openai("gpt-4o"),
        system: `You are a helpful assistant that can help with scheduling appointments.
        Only respond to questions using information from tool calls.
        If no relevant information is found in the tool calls, respond, "Sorry, I cannot find any available booking windows."`,
        messages: convertToCoreMessages(messages),
        tools: {
            getBookingWindows: tool({
                description: "get information from your knowledge base about available booking windows",
                parameters: z.object({
                    question: z.string().describe("the question asked by the user"),
                }),
                execute: async ({ question }) => findBookingWindows(question),
            }),
        },
    });

    return result.toDataStreamResponse();
}