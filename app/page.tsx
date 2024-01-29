'use client';

import Permission from '@components/home/Permission';
import {
  checkPermission,
  getCameras,
  getStream,
  requestMediaAccess,
} from '@lib/media';
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const [allowAccess, setAllowAccess] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<MediaDeviceInfo>();
  const video = useRef<HTMLVideoElement | null>(null);
  const [permissionsGranted, setPermissionsGranted] = useState({
    loading: true,
    status: false,
  });
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>();

  // Check if permissions are granted
  useEffect(() => {
    checkPermission(setPermissionsGranted);
  }, []);

  // Get cameras or request media access
  useEffect(() => {
    if (permissionsGranted) getCameras(setCameras);
    if (selectedCamera) getStream(selectedCamera, video);
    if (allowAccess) requestMediaAccess(setPermissionsGranted);
  }, [allowAccess, permissionsGranted, selectedCamera]);

  // Start recording
  function startRecording() {
    if (!video.current) return;

    const stream = video.current.srcObject as MediaStream;
    mediaRecorder.current = new MediaRecorder(stream);

    const chunks: Blob[] = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.current.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    };

    mediaRecorder.current.start();
    setIsRecording(true);
  }

  // Strop recording
  function stopRecording() {
    if (!mediaRecorder.current) return;

    mediaRecorder.current.stop();
    setIsRecording(false);
  }

  // Download video
  function downloadVideo(url: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recorded-video.mp4';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <main>
      {!permissionsGranted.loading && !permissionsGranted.status && (
        <Permission setAllowAccess={setAllowAccess} />
      )}

      {permissionsGranted.status && cameras.length && (
        <select
          id='cameraSelect'
          onChange={(e) =>
            setSelectedCamera(
              cameras.find((camera) => camera.deviceId === e.target.value)
            )
          }
        >
          <option value=''>-- Select Camera --</option>
          {cameras.map((camera) => (
            <option key={camera.deviceId} value={camera.deviceId}>
              {camera.label || `Camera ${camera.deviceId.slice(0, 5)}`}
            </option>
          ))}
        </select>
      )}

      {selectedCamera && (
        <div>
          <video ref={video} autoPlay></video>

          {!isRecording && (
            <button onClick={startRecording}>Start Recording</button>
          )}
          {isRecording && (
            <button onClick={stopRecording}>Stop Recording</button>
          )}
          {videoUrl && (
            <button onClick={() => downloadVideo(videoUrl)}>
              Download video
            </button>
          )}
        </div>
      )}
    </main>
  );
}
