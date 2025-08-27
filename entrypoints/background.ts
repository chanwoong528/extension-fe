import { SCREENSHOT_ACTION_TYPES } from "@/constants/actionTypes";

export default defineBackground(() => {
  console.log("Background script loaded");

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Background received:", message);

    if (message.type === SCREENSHOT_ACTION_TYPES.CAPTURE_SCREENSHOT) {
      console.log("CAPTURE_SCREENSHOT", message);
      browser.tabs.captureVisibleTab({ format: "jpeg" }).then((screenshot) => {
        // Content script로 스크린샷 데이터 전송
        browser.tabs
          .query({ active: true, currentWindow: true })
          .then((tabs) => {
            if (tabs.length > 0) {
              browser.tabs.sendMessage(tabs[0].id!, {
                type: "CAPTURE_SCREENSHOT",
                screenshot: screenshot,
                boundingClientRect: message.boundingClientRect,
              });
            }
          });
        sendResponse({ success: true, screenshot });
        return true;
      });
    }

    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs.length > 0) {
        browser.tabs
          .sendMessage(tabs[0].id!, message)
          .then(() => {
            sendResponse({ success: true });
          })
          .catch((error) => {
            sendResponse({ success: false, error: error.message });
          });
      }
    });
    return true;
  });
});
