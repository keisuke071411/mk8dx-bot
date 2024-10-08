import type { NextRequest } from "next/server";
import { OBSWebSocket } from "obs-websocket-js";

export async function POST(request: NextRequest) {
  const obs = new OBSWebSocket();

  try {
    const body = await request.json();

    await obs.connect(`http://${body.localIp}:4455`, process.env.OBS_PASSWORD);
    console.info("Connected to OBS WebSocket");

    // 現在のプレビューを取得してスクリーンショットを保存
    const response = await obs.call("GetSourceScreenshot", {
      sourceName: "game",
      imageFormat: "png",
    });

    return new Response(
      JSON.stringify({ success: true, screenshot: response.imageData }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Error connecting to OBS WebSocket:", error);
    return new Response(JSON.stringify({ success: false, error: error }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } finally {
    obs.disconnect();
  }
}
