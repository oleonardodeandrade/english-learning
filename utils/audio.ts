import { Audio } from "expo-av";
import { useState } from "react";

export const evaluatePronunciation = async (topic: string): Promise<number> => {
  console.log(`Evaluating pronunciation for topic: ${topic}`);
  return Math.floor(Math.random() * 100);
};

export const useAudioRecorder = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [audioUri, setAudioUri] = useState<string | null>(null);

  const startRecording = async () => {
    try {
      if (permissionResponse?.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        alert("Permission to access microphone is required!");
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        console.log("Audio URI:", uri);
        setAudioUri(uri);
        setRecording(null);
      } catch (err) {
        console.error('Failed to stop recording', err);
      }
    }
  };

  return {
    recording,
    audioUri,
    startRecording,
    stopRecording,
  };
};
