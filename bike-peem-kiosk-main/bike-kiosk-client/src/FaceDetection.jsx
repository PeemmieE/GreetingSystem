import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import Greeting from './Greeting';

function FaceDetection() {

  let time = new Date().toLocaleTimeString();
  const [currentTime, setCurrentTime] = useState(time);

  const updateTime = async () => {
    let time = new Date().toLocaleTimeString();
    setCurrentTime(time);
  }

  setInterval(updateTime, 1000)

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRefA = useRef(null);
  const intervalRefB = useRef(null);
  const videoHeight = 480;
  const videoWidth = 640;

  useEffect(() => {
    const loadModelsAndStartVideo = async () => {
      await loadModels();
      await startVideo();
    };
    loadModelsAndStartVideo();
    return () => {
      intervalRefA.current && clearInterval(intervalRefA.current);
      intervalRefB.current && clearInterval(intervalRefB.current);
    };
  }, []);

  useEffect(() => {
    const playListener = () => runFaceRecognition();
    if (videoRef.current) {
      videoRef.current.addEventListener('play', playListener);
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('play', playListener);
      }
    };
  }, [videoRef.current]);

  const loadModels = async () => {
    const MODEL_URL = '/models';
    try {
      await Promise.all([faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)]);
    } catch (error) {
      console.error('Failed to load models', error);
    }
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      videoRef.current.srcObject = stream;

    } catch (error) {
      console.error('Failed to start video stream', error);
    }
  };

  const runFaceRecognition = async () => {
    if (!videoRef.current) return;

    const canvas = faceapi.createCanvasFromMedia(videoRef.current);
    canvas.className = "absolute top-0 left-1/2 transform -translate-x-1/2 z-10 h-full object-cover scale-x-[-1]";
    document.body.appendChild(canvas);
    canvasRef.current = canvas;

    const displaySize = { width: videoWidth, height: videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    intervalRefA.current = setInterval(async () => {
      const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options());
      if (detections.length > 0) {
        videoScreenshot();
      }
    }, 3000);

    intervalRefB.current = setInterval(async () => {
      const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options());
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      resizedDetections.forEach(detection => {
        const box = detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, { label: "" });
        drawBox.draw(canvas);
      });
    }, 100);
  };

  const videoScreenshot = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);

    canvas.toBlob(blob => {
      const fileName = 'env-' + Date.now().toString() + ".jpg";
      const file = new File([blob], fileName, { type: "image/jpeg" });
      prediction(file);
    }, 'image/jpeg');
  };

  const [propData, setPropData] = useState([]);

  // Function for making the prediction request
  const prediction = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`${import.meta.env.VITE_SERVER_API}/prediction`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const data = response.data;

      // console.log(data[0].singleFace);

      setPropData(data)

    } catch (error) {
      console.error('Prediction error', error);
    }
  };

  // const greeting = async (faces) => {

  //   const getVoices = () => new Promise(resolve => {
  //     const voices = speechSynthesis.getVoices();
  //     if (voices.length) {
  //       resolve(voices);
  //     } else {
  //       speechSynthesis.onvoiceschanged = () => {
  //         resolve(speechSynthesis.getVoices());
  //       };
  //     }
  //   });

  //   const voices = await getVoices();

  //   faces.forEach(face => {
  //     if (face !== "empty") {
  //       const sanitizedFace = face.replace(/\s+/g, '');
  //       const utterance = new SpeechSynthesisUtterance(`ยินดีต้อนรับคุณ${sanitizedFace}`);
  //       utterance.voice = voices.find(v => v.name.includes('Premwadee')) || null;
  //       utterance.rate = 1;
  //       speechSynthesis.speak(utterance);
  //     }
  //   });
  // };

  return (
    <>

      <div className='text-center z-10 absolute w-full text-2xl mt-4 font-bold' >
        {currentTime}
      </div>

      <div className='flex justify-center items-center h-screen w-screen overflow-hidden'>
        <video ref={videoRef} autoPlay muted className='h-full object-cover z-0 scale-x-[-1]'></video>
      </div>

      <Greeting propData={propData} />

    </>
  );
};

export default FaceDetection;