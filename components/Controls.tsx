// components/Controls.tsx
import { useEffect, useState } from 'react';

interface Device {
  deviceId: string;
  label: string;
}

const Controls = () => {
  const [selectedMic, setSelectedMic] = useState<string | null>(null);
  const [selectedCam, setSelectedCam] = useState<string | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);

  const listDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setDevices(
        devices.map((device) => ({
          deviceId: device.deviceId,
          label: device.label || 'Unknown',
        }))
      );
    } catch (error) {
      console.error('Error listing devices:', error);
    }
  };

  useEffect(() => {
    let t: number | undefined;
    const tick = async () => {
      await listDevices();
    };
    t = setInterval(tick, 1000); // Polling every second (unchanged)
    return () => {
      if (t !== undefined) {
        clearInterval(t); // Clear interval, returns void
      }
    }; // Cleanup returns void, fixing type error
  }, [selectedMic, selectedCam]);

  // UI unchanged to preserve design and interaction
  return (
    <div>
      <select onChange={(e) => setSelectedMic(e.target.value)}>
        {devices
          .filter((d) => d.kind === 'audioinput')
          .map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label}
            </option>
          ))}
      </select>
      <select onChange={(e) => setSelectedCam(e.target.value)}>
        {devices
          .filter((d) => d.kind === 'videoinput')
          .map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label}
            </option>
          ))}
      </select>
    </div>
  );
};

export default Controls;