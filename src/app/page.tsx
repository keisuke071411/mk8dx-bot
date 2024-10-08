"use client";

import { useTeamScoreList } from "@/hooks/useTeamScoreList";
import { base64toBlob } from "@/lib/blob";
import { useCallback, useEffect, useRef } from "react";
import { Form } from "./_components/Form";

export default function Home() {
  const hasFetched = useRef(false);
  const { setTeamScoreList, teamScoreList, getRaceResult } = useTeamScoreList();

  const fetchData = useCallback(async () => {
    const captureScreenshotByObs = async (localIp: string) => {
      const response = await fetch("/api/obs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ localIp }),
      });

      const data = await response.json();

      return data.screenshot;
    };

    const getLocalIp = async () => {
      const response = await fetch("/api/localIp", {
        method: "GET",
      });

      const data = await response.json();

      return data.address as string;
    };

    const localIp = await getLocalIp();

    const res = await captureScreenshotByObs(localIp);
    const blob = base64toBlob(res, "image/jpg");

    const formData = new FormData();
    formData.append("file", blob);

    const response = await fetch(
      process.env.NEXT_PUBLIC_API_BACKEND_URL as string,
      {
        method: "POST",
        body: formData,
      },
    );

    const result = await response.json();

    // 結果に基づき再度fetchDataを呼び出す
    if (result === "fail") {
      console.info("Fail - 2秒後に再試行");
      setTimeout(fetchData, 2000);
    } else if (result === "success") {
      console.info("Success - 次回呼び出しは2分後");
      setTimeout(fetchData, 120000);
      await getRaceResult(blob);
    }
  }, [getRaceResult]);

  useEffect(() => {
    if (!hasFetched.current) {
      fetchData(); // 初回呼び出し
      hasFetched.current = true; // 次回以降は実行されない
    }
  }, [fetchData]);

  return (
    teamScoreList.length > 0 && (
      <Form teamScoreList={teamScoreList} setTeamScoreList={setTeamScoreList} />
    )
  );
}
