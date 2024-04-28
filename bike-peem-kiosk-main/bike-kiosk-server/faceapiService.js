const faceapi = require("@vladmandic/face-api/dist/face-api.node");
const tf = require("@tensorflow/tfjs-node");
const canvas = require("canvas");
const prepairKnownData = require('./prepairKnownData');
const fs = require('fs').promises;
const prepairUnKnownData = require("./prepairUnknownData");
const path = require("path");

const { Canvas, Image, loadImage } = canvas;
global.ImageData = canvas.ImageData;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData: global.ImageData });

let modelsLoaded = false;

async function prepareImage(file) {
  const decoded = tf.node.decodeImage(file);
  const casted = decoded.toFloat();
  const result = casted.expandDims(0);
  decoded.dispose();
  casted.dispose();
  return result;
};

let labeledFaceDescriptors = null;
let faceMatcher;

function setLabeledFaceDescriptors(newValue) {
  labeledFaceDescriptors = newValue;
}

// function getLabeledFaceDescriptors() {
//   return labeledFaceDescriptors;
// }

async function detect(envImg, envFile) {

  if (!labeledFaceDescriptors) {
    console.log('load face matcher')
    labeledFaceDescriptors = await getLabeledFaceDescriptions();
    faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
  }

  try {
    const detections = await faceapi.detectAllFaces(envImg)
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender()
      .withFaceDescriptors();

    const allExtractFaces = await faceapi.extractFaces(envImg, detections.map(det => det.detection));

    if (detections.length >= 1) {
      let knownData = [];
      let unknownData = [];
      let knowIndex = [];
      let unknowIndex = [];
      detections.map((detection, index) => {
        if (detection.detection.score >= 0.7) {
          const faceMatch = faceMatcher.findBestMatch(detection.descriptor);
          if (faceMatch.label != 'unknown') {
            knownData.push({ detection, faceMatch });
            knowIndex.push(index);
          }
          else {
            unknownData.push(detection);
            unknowIndex.push(index)
          }
        }
      });

      if (unknownData.length > 0) {
        const extractFacesUnknown = unknowIndex.map(index => allExtractFaces[index]);
        prepairUnKnownData.prepairData(unknownData, extractFacesUnknown, envFile);
      }
      if (knownData.length > 0) {
        const extractFacesKnown = knowIndex.map(index => allExtractFaces[index]);
        return prepairKnownData.prepairData(knownData, extractFacesKnown, envFile);
      }
      else {
        return []
      }
    }

    return []

  }
  catch (error) {
    console.log(error);
    return []
  }
};

async function getLabeledFaceDescriptions() {
  const labelsDir = './labels';
  const labels = await fs.readdir(labelsDir, { withFileTypes: true })
    .then(dirents => dirents.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name));

  return Promise.all(labels.map(async label => {
    const descriptions = [];
    const dirPath = path.join(labelsDir, label);
    const imageFiles = await fs.readdir(dirPath);

    const jpgFiles = imageFiles.filter(file => path.extname(file).toLowerCase() === '.jpg');

    for (let imageName of jpgFiles) {
      const imgPath = path.join(dirPath, imageName);
      try {
        // Read the image file into a buffer and load it into canvas
        const imageBuffer = await fs.readFile(imgPath);
        const img = await canvas.loadImage(imageBuffer);
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
        if (detections) {
          descriptions.push(detections.descriptor);
        }
      } catch (error) {
        console.error(`Error processing image ${imageName} in ${dirPath}:`, error);
      }
    }
    return new faceapi.LabeledFaceDescriptors(label, descriptions);
  }));
};

async function loadModels() {
  if (modelsLoaded) return;

  await faceapi.nets.ssdMobilenetv1.loadFromDisk('./models');
  await faceapi.nets.faceLandmark68Net.loadFromDisk('./models');
  await faceapi.nets.faceRecognitionNet.loadFromDisk('./models');
  await faceapi.nets.faceExpressionNet.loadFromDisk('./models');
  await faceapi.nets.ageGenderNet.loadFromDisk('./models');
  console.log('Models loaded');

  modelsLoaded = true;
};

async function main(file) {

  await tf.setBackend("tensorflow");
  tf.enableProdMode();
  tf.ENV.set("DEBUG", false);
  await tf.ready();

  await loadModels();

  const tensor = await prepareImage(file.data);
  const result = await detect(tensor, file);

  // console.log(tensor)

  tensor.dispose();

  return result;
};

module.exports = {
  detect: main, setLabeledFaceDescriptors
};