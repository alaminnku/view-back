import { Dispatch, MutableRefObject, SetStateAction } from 'react';

type PermissionsGrated = { loading: boolean; status: boolean };

// Check camera and microphone access
export async function checkPermission(
  setPermissionsGranted: Dispatch<SetStateAction<PermissionsGrated>>
) {
  const cameraPermission = await navigator.permissions.query({
    name: 'camera' as PermissionName,
  });
  const microPhonePermission = await navigator.permissions.query({
    name: 'microphone' as PermissionName,
  });

  const permissionState =
    cameraPermission.state === 'granted' &&
    microPhonePermission.state === 'granted';

  setPermissionsGranted({ loading: false, status: permissionState });
}

// Request camera and microphones access
export async function requestMediaAccess(
  setPermissionsGranted: Dispatch<SetStateAction<PermissionsGrated>>
) {
  try {
    await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setPermissionsGranted({ loading: false, status: true });
  } catch (err) {
    console.log(err);
  }
}

// Get cameras and microphones
export async function getMedia(
  setCameras: Dispatch<SetStateAction<MediaDeviceInfo[]>>,
  setMicrophones: Dispatch<SetStateAction<MediaDeviceInfo[]>>
) {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === 'videoinput');
    const microphones = devices.filter(
      (device) => device.kind === 'audioinput'
    );
    setCameras(cameras);
    setMicrophones(microphones);
  } catch (err) {
    console.log(err);
  }
}

// Get audio and video stream
export async function getStream(
  selectedCamera: MediaDeviceInfo,
  selectedMicrophone: MediaDeviceInfo,
  videoRef: MutableRefObject<HTMLVideoElement | null>
) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { deviceId: selectedCamera.deviceId },
    audio: { deviceId: selectedMicrophone.deviceId },
  });

  if (videoRef.current) {
    videoRef.current.srcObject = stream;
  }
}

// Start transcription
export function startRecognition(
  recognition: SpeechRecognition,
  setTranscript: Dispatch<SetStateAction<string>>
) {
  if (!recognition) return;

  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript;
    setTranscript(transcript);
  };
  recognition.onerror = (err) => {
    console.log(err);
  };
  recognition.start();
}
