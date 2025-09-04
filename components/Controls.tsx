// components/Controls.tsx
import { useEffect, useState } from 'react';

interface Device {
  deviceId: string;
  label: string;
  kind: string;
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
          kind: device.kind,
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
    t = setInterval(tick, 1000);
    return () => {
      if (t !== undefined) {
        clearInterval(t);
      }
    };
  }, [selectedMic, selectedCam]);

  return (
    <div>
      <select onChange={(e) => setSelectedMic(e.target.value)}>
        <option value="">Select Microphone</option>
        {devices
          .filter((d) => d.kind === 'audioinput')
          .map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label}
            </option>
          ))}
      </select>
      <select onChange={(e) => setSelectedCam(e.target.value)}>
        <option value="">Select Camera</option>
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