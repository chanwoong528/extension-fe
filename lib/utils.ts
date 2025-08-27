import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Screenshot utility functions
export const screenshotUtils = {
  // Generate filename for screenshots
  generateFilename: (elementInfo: any, extension: string = "png"): string => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const elementName = elementInfo.tagName || "element";
    const elementId = elementInfo.id ? `-${elementInfo.id}` : "";
    return `${elementName}${elementId}-${timestamp}.${extension}`;
  },

  // Format file size
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  // Validate screenshot data
  validateScreenshotData: (data: string): boolean => {
    return data.startsWith("data:image/") && data.length > 100;
  },

  // Get element dimensions for display
  getElementDimensions: (element: any): { width: number; height: number } => {
    if (element.position) {
      return {
        width: Math.round(element.position.width),
        height: Math.round(element.position.height),
      };
    }
    return { width: 0, height: 0 };
  },

  // Format timestamp for display
  formatTimestamp: (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  },

  // Get element display name
  getElementDisplayName: (element: any): string => {
    const tagName = (element.tagName || "unknown").toUpperCase();
    const id = element.id ? `#${element.id}` : "";
    const className = element.className
      ? `.${element.className.split(" ").join(".")}`
      : "";
    return `${tagName}${id}${className}`;
  },
};

export const imageUtils = {
  base64ToBlob: (base64: string): Blob => {
    const byteString = atob(base64.split(",")[1]);
    const mimeString = base64.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  },
};
