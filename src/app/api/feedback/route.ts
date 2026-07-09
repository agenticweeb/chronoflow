import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { feedbackType, message, contact, context } = await req.json();

    const webhookUrl = process.env.DISCORD_FEEDBACK_WEBHOOK;

    if (!webhookUrl) {
      console.warn("Discord Webhook URL is missing in environment variables.");
      return NextResponse.json({ success: true, localOnly: true });
    }

    if (!message?.trim()) {
      return NextResponse.json({ success: false, error: "Message is required" }, { status: 400 });
    }

    // Format the rich embed message for Discord
    const discordPayload = {
      username: "ChronoFlow Feedback Bot",
      avatar_url: "https://chronoflow.app/logo.png", // Add logo if available
      embeds: [
        {
          title: `🎯 New ${feedbackType === "bug" ? "Bug Report" : "Feature Suggestion"}`,
          color: feedbackType === "bug" ? 15158332 : 10181046, // Red for bugs, purple for suggestions
          fields: [
            {
              name: "Message",
              value: message,
            },
            {
              name: "User Contact (Optional)",
              value: contact || "Anonymous",
              inline: true,
            },
            {
              name: "Context / Anime Name",
              value: context || "General Site Feedback",
              inline: true,
            },
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: "ChronoFlow User Report Engine",
          },
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(discordPayload),
    });

    if (!response.ok) {
      throw new Error(`Discord Webhook failed: ${response.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback submission failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send feedback" },
      { status: 500 }
    );
  }
}
