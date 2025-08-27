import { SCREENSHOT_ACTION_TYPES } from "@/constants/actionTypes";
import { clipboardUtils, imageUtils } from "@/lib/utils";

// Simple element hover highlighting
const ELEMENT_HOVER_STYLES = `
  .element-hover-highlight {
    outline: 2px solid #007bff !important;
    outline-offset: 2px !important;
    cursor: crosshair !important;
  }
`;

const POPUP_STYLES = `
  .popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.5);
    padding: 10%;
    border-radius: 10px;
    overflow: hidden;
    z-index: 1000;
  }
  .popup img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .popup img:hover {
    cursor: pointer;
  }
`;
// Simple hover highlighter
class ElementHoverHighlighter {
  private styleElement: HTMLStyleElement | null = null;
  private currentHighlightedElement: Element | null = null;
  public isActive: boolean = false;

  constructor() {}

  init(): void {
    if (this.isActive) return;

    this.isActive = true;
    // Inject styles
    this.injectStyles();

    // Add hover event listeners
    this.addHoverListeners();

    console.log("Element hover highlighter initialized");
  }

  private injectStyles(): void {
    this.styleElement = document.createElement("style");
    this.styleElement.textContent = ELEMENT_HOVER_STYLES;
    document.head.appendChild(this.styleElement);
  }

  private addHoverListeners(): void {
    // Add mouseover and mouseout listeners to all elements
    document.addEventListener("mouseover", this.handleMouseOver.bind(this));
    document.addEventListener("mouseout", this.handleMouseOut.bind(this));
  }

  private handleMouseOver(event: MouseEvent): void {
    if (!this.isActive) return;

    const target = event.target as Element;
    if (
      !target ||
      target === document.body ||
      target === document.documentElement
    )
      return;

    // Remove previous highlight
    if (this.currentHighlightedElement) {
      this.currentHighlightedElement.classList.remove(
        "element-hover-highlight",
      );
    }

    // Add highlight to current element
    target.classList.add("element-hover-highlight");
    this.currentHighlightedElement = target;
  }

  private handleMouseOut(event: MouseEvent): void {
    if (!this.isActive) return;

    const target = event.target as Element;
    if (!target) return;

    // Remove highlight
    target.classList.remove("element-hover-highlight");
    this.currentHighlightedElement = null;
  }

  public async onClickElement(event: MouseEvent): Promise<{
    element: Element;
    boundingClientRect: DOMRect;
  }> {
    if (!this.isActive) return Promise.reject("Not in selection mode");

    const target = event.target as Element;

    if (!target) throw new Error("No target element found");
    if (!target.classList.contains("element-hover-highlight"))
      return Promise.resolve({
        element: target,
        boundingClientRect: target.getBoundingClientRect(),
      });

    // Remove highlight
    target.classList.remove("element-hover-highlight");

    const boundingClientRect = target.getBoundingClientRect();
    console.log("boundingClientRect:", boundingClientRect);

    await this.sendScreenshot(boundingClientRect);
    // console.log("res from  content script getScreenshot:", screenshot);

    this.destroy();
    this.currentHighlightedElement = null;

    return { element: target, boundingClientRect };
  }

  async sendScreenshot(boundingClientRect: DOMRect): Promise<string> {
    // Content script에서는 captureVisibleTab을 직접 사용할 수 없음
    // Background script에 메시지를 보내서 스크린샷을 요청해야 함
    const response = await browser.runtime.sendMessage({
      type: SCREENSHOT_ACTION_TYPES.CAPTURE_SCREENSHOT,
      boundingClientRect,
    });

    if (response && response.success) {
      return response.screenshot;
    } else {
      throw new Error("Failed to capture screenshot");
    }
  }
  public destroy(): void {
    this.isActive = false;

    // Remove highlight from current element
    if (this.currentHighlightedElement) {
      this.currentHighlightedElement.classList.remove(
        "element-hover-highlight",
      );
    }
    // Remove styles
    if (this.styleElement) {
      document.head.removeChild(this.styleElement);
      this.styleElement = null;
    }
    document.removeEventListener("mouseover", this.handleMouseOver);
    document.removeEventListener("mouseout", this.handleMouseOut);
  }
}

const elementHoverHighlighter = new ElementHoverHighlighter();
// Content script main function
export default defineContentScript({
  matches: ["https://*/*"],
  main() {
    const cropScreenshot = async (
      screenshot: string, // base64 data URL (e.g. from captureVisibleTab)
      boundingClientRect: DOMRect, // from element.getBoundingClientRect()
    ) => {
      try {
        const img = new Image();

        // take count with window.scrollY

        return new Promise<string>((resolve, reject) => {
          // img.onerror = () => reject(new Error("Failed to load image"));
          img.src = screenshot;
          img.onload = () => {
            try {
              const dpr = window.devicePixelRatio || 1;

              // adjust for scroll and DPR
              const sx = Math.round(boundingClientRect.left * dpr);
              const sy = Math.round(boundingClientRect.top * dpr);
              const sw = Math.round(boundingClientRect.width * dpr);
              const sh = Math.round(boundingClientRect.height * dpr);

              // new canvas
              const canvas = document.createElement("canvas");
              canvas.width = sw;
              canvas.height = sh;

              const ctx = canvas.getContext("2d");
              if (!ctx) {
                reject(new Error("No 2D context"));
                return;
              }
              ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
              const result = canvas.toDataURL("image/png", 0.5); // 70% quality for compression

              resolve(result);
            } catch (error) {
              reject(error);
            }
          };
        });
      } catch (error) {
        console.error("Failed to crop screenshot:", error);
        throw new Error("Failed to crop screenshot");
      }
    };
    console.log("Content script loaded");

    const ScreenShotLayerPopup = (imageSrc: Blob) => {
      const div = document.createElement("div");
      div.classList.add("popup");

      const style = document.createElement("style");
      style.textContent = POPUP_STYLES;
      document.head.appendChild(style);

      const img = document.createElement("img");
      img.src = URL.createObjectURL(imageSrc);
      div.appendChild(img);
      document.body.appendChild(div);
    };

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === SCREENSHOT_ACTION_TYPES.START_ELEMENT_SELECTION) {
        elementHoverHighlighter.init();

        sendResponse({ success: true });
        return true;
      }
      if (message.type === SCREENSHOT_ACTION_TYPES.CAPTURE_SCREENSHOT) {
        console.log("CAPTURE_SCREENSHOT received");
        const croppedScreenshot = cropScreenshot(
          message.screenshot,
          message.boundingClientRect,
        ).then((croppedScreenshot) => {
          const blob = imageUtils.base64ToBlob(croppedScreenshot);
          clipboardUtils.copyToClipboard(blob);
          ScreenShotLayerPopup(blob);
        });

        sendResponse({ success: true });
        elementHoverHighlighter.destroy();
        return true;
      }
    });

    document.addEventListener("click", (event) => {
      if (elementHoverHighlighter.isActive) {
        elementHoverHighlighter.onClickElement(event);
      }
    });
  },
});
