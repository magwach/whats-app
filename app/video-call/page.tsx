"use client";

import Daily from "@daily-co/daily-js";
import { useEffect, useState } from "react";

export default function VideoCallPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const encodedUrl = params.get("room");
      if (!encodedUrl) throw new Error("No room URL provided");

      const roomUrl = decodeURIComponent(encodedUrl);

      const call = Daily.createFrame({
        showLeaveButton: true,
        iframeStyle: {
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
        },
      });

      call.join({ url: roomUrl });
    } catch (err) {
      console.error(err);
      const error = err as Error;
      setError(error.message || "Failed to join the video call");
    }
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return null;
}
