import React, { useState, useRef } from 'react';
import { Camera, StopCircle } from 'lucide-react';

const VideoRecorder = ({ onRecordingComplete }) => {
  const [recording, setRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      setError(null);
      
      console.log('Requesting media permissions...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setStream(mediaStream);
      videoRef.current.srcObject = mediaStream;
      
      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunksRef.current, {
          type: 'video/webm'
        });
        onRecordingComplete?.(videoBlob);
      };
      
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error('Error in startRecording:', err);
      setError(err.message || 'Failed to start recording');
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setRecording(false);
      setStream(null);
    } catch (err) {
      console.error('Error in stopRecording:', err);
      setError(err.message || 'Failed to stop recording');
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex justify-center">
        {!recording ? (
          <button
            onClick={startRecording}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Camera className="h-5 w-5" />
            <span>Start Recording</span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <StopCircle className="h-5 w-5" />
            <span>Stop Recording</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoRecorder; 