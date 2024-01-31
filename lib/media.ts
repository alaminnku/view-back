import { Dispatch, MutableRefObject, SetStateAction } from 'react';

type PermissionsGrated = { loading: boolean; status: boolean };

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

export async function getCameras(
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

export async function getStream(
  camera: MediaDeviceInfo,
  microphone: MediaDeviceInfo,
  videoRef: MutableRefObject<HTMLVideoElement | null>
) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { deviceId: camera.deviceId },
    audio: { deviceId: microphone.deviceId },
  });

  if (videoRef.current) {
    videoRef.current.srcObject = stream;
  }
}
