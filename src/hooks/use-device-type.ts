import { useEffect, useState } from "react";

export type DeviceType = "iOS" | "Android" | "PC" | "Unknown";

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>("Unknown");

  useEffect(() => {
    const userAgent = navigator.userAgent;

    if (/iPad|iPhone|iPod/.test(userAgent)) {
      setDeviceType("iOS");
    } else if (/android/i.test(userAgent)) {
      setDeviceType("Android");
    } else if (/windows|macintosh|linux/i.test(userAgent)) {
      setDeviceType("PC");
    } else {
      setDeviceType("Unknown");
    }
  }, []);

  return deviceType;
}
