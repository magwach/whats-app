import { NextResponse } from "next/server";

export async function POST() {
  const resp = await fetch("https://api.daily.co/v1/rooms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      properties: {
        max_participants: 200,
        enable_prejoin_ui: true,
        enable_chat: true,
        enable_emoji_reactions: true,
        enable_screenshare: true,
        enable_noise_cancellation_ui: true,
        owner_only_broadcast: false,
        start_video_off: false,
        start_audio_off: false,
      },
    }),
  });

  const data = await resp.json();
  return NextResponse.json(data);
}
