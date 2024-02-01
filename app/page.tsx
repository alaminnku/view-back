'use client';

import Permission from '@components/home/Permission';
import {
  checkPermission,
  getMedia,
  getStream,
  requestMediaAccess,
  startRecognition,
} from '@lib/media';
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const [allowAccess, setAllowAccess] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [selectedCam, setSelectedCam] = useState<MediaDeviceInfo>();
  const [selectedMic, setSelectedMic] = useState<MediaDeviceInfo>();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [permissions, setPermissions] = useState({
    checking: true,
    granted: false,
  });
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>();
  const [transcript, setTranscript] = useState<string>('');
  const [recognition, setRecognition] = useState<SpeechRecognition>();

  // Check if permissions are granted
  useEffect(() => {
    checkPermission(setPermissions);

    if ('webkitSpeechRecognition' in window) {
      let recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      setRecognition(recognition);
    }
  }, []);

  // Request media access
  useEffect(() => {
    if (allowAccess) requestMediaAccess(setPermissions);
  }, [allowAccess]);

  // Get cameras and microphones
  useEffect(() => {
    if (permissions.granted) getMedia(setCameras, setMicrophones);
  }, [permissions]);

  // Get stream from selected cam and mic
  useEffect(() => {
    if (selectedCam && selectedMic)
      getStream(selectedCam, selectedMic, videoRef);
  }, [selectedCam, selectedMic]);

  // Start recording
  function startRecording() {
    if (!videoRef.current || !recognition) return;

    const stream = videoRef.current.srcObject as MediaStream;
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

    setIsRecording(true);
    mediaRecorder.current.start();
    startRecognition(recognition, setTranscript);
  }

  // Strop recording
  function stopRecording() {
    if (!mediaRecorder.current || !recognition) return;

    mediaRecorder.current.stop();
    recognition.stop();
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
    <main
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {!permissions.checking && !permissions.granted && (
        <Permission setAllowAccess={setAllowAccess} />
      )}

      <div>
        {permissions.granted && cameras.length && (
          <select
            onChange={(e) =>
              setSelectedCam(
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
        {permissions.granted && microphones.length && (
          <select
            onChange={(e) =>
              setSelectedMic(
                microphones.find(
                  (microphone) => microphone.deviceId === e.target.value
                )
              )
            }
          >
            <option value=''>-- Select Microphone --</option>
            {microphones.map((microphone) => (
              <option key={microphone.deviceId} value={microphone.deviceId}>
                {microphone.label ||
                  `Microphone ${microphone.deviceId.slice(0, 5)}`}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedCam && selectedMic && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: '30px 0px',
          }}
        >
          <video ref={videoRef} autoPlay muted></video>

          {!isRecording && (
            <button style={buttonStyle} onClick={startRecording}>
              Start Recording
            </button>
          )}
          {isRecording && (
            <button style={buttonStyle} onClick={stopRecording}>
              Stop Recording
            </button>
          )}
          {videoUrl && (
            <button style={buttonStyle} onClick={() => downloadVideo(videoUrl)}>
              Download video
            </button>
          )}
        </div>
      )}

      {transcript && (
        <textarea rows={20} cols={90} style={{ border: '1px solid black' }}>
          {transcript}
        </textarea>
      )}
    </main>
  );
}

const buttonStyle = {
  border: 'none',
  padding: '8px 16px',
  color: 'white',
  backgroundColor: 'black',
  marginTop: '16px',
};
