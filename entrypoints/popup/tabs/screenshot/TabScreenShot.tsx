import React, { useState } from "react";
import { SCREENSHOT_ACTION_TYPES } from "@/constants/actionTypes";
import { Button } from "@/components/ui/button";

export default function TabScreenShot() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>("");

  const handleStartElementSelection = async () => {
    try {
      setIsLoading(true);
      setStatus("Starting element selection...");

      const response = await browser.runtime.sendMessage({
        type: SCREENSHOT_ACTION_TYPES.START_ELEMENT_SELECTION,
      });

      if (response?.success) {
        setStatus(
          "✅ Element selection started successfully! Go to the webpage and hover over elements.",
        );
        console.log("Element selection started:", response);
      } else {
        setStatus(
          `❌ Failed to start element selection: ${
            response?.error || "Unknown error"
          }`,
        );
        console.error("Failed to start element selection:", response);
      }
    } catch (error) {
      setStatus(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      console.error("Error starting element selection:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === SCREENSHOT_ACTION_TYPES.CAPTURE_SCREENSHOT) {
        console.log("popup~~ CAPTURE_SCREENSHOT received");
      }
    });
    return () => {
      browser.runtime.onMessage.removeListener(
        (message, sender, sendResponse) => {
          if (message.type === SCREENSHOT_ACTION_TYPES.CAPTURE_SCREENSHOT) {
            console.log("popup~~ CAPTURE_SCREENSHOT received");
          }
        },
      );
    };
  }, []);

  return (
    <div className='space-y-4 p-4'>
      <h1 className='text-lg font-semibold'>Element Selection Tool</h1>

      <div className='space-y-3'>
        <Button
          onClick={handleStartElementSelection}
          disabled={isLoading}
          className='w-full'>
          {isLoading ? "Starting..." : "Start Element Selection"}
        </Button>

        {status && (
          <div
            className={`text-sm p-3 rounded border ${
              status.includes("✅")
                ? "bg-green-50 border-green-200 text-green-800"
                : status.includes("❌")
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}>
            {status}
          </div>
        )}
      </div>

      <div className='text-xs text-gray-500 bg-gray-50 p-3 rounded border'>
        <div className='font-medium mb-2'>How to use:</div>
        <ol className='list-decimal list-inside space-y-1'>
          <li>Click "Start Element Selection" button above</li>
          <li>Go to the webpage where you want to select elements</li>
          <li>Hover over any element to see blue border highlighting</li>
          <li>Elements will be highlighted automatically when you hover</li>
        </ol>
      </div>
    </div>
  );
}
