const faceapi = require("@vladmandic/face-api/dist/face-api.node");
const NodeCache = require("node-cache");
const canvas = require("canvas");
// const db = require('./database/mysql.js');
const { saveUnknownData } = require('./saveUnknownData.js');
const sharp = require('sharp');
const axios = require('axios');
require('dotenv').config();

const { Canvas, Image } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData: canvas.ImageData });

const unknownCache = new NodeCache({ stdTTL: 30, checkperiod: 30 });
let descriptions = [];

const prepairData = async (unknownData, extractFacesUnknown, envFile) => {

  const labels = unknownCache.keys();

  let dataForDatabase = [];
  let singleFaceImages = [];

  const resizedEnvFileBuffer = await sharp(envFile.data)
    .resize({ width: 200 })
    .jpeg({ quality: 30 })
    .toBuffer();

  envFile.data = resizedEnvFileBuffer;

  if (labels.length === 0) {
    await Promise.all(unknownData.map(async (data, i) => {
      const label = Date.now().toString() + i.toString();
      const newDescriptions = new Float32Array(data.descriptor);
      unknownCache.set(label, true);
      descriptions.push({ label, descriptions: newDescriptions });

      //prepairing data
      const expression = Object.entries(data.expressions).reduce((a, b) => a[1] > b[1] ? a : b)[0];
      const now = new Date();
      const thailandTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
      const parts = thailandTime.toISOString().split('T')[0].split('-');
      const date = `${parts[2]}/${parts[1]}/${parts[0]}`;
      const time = new Date().toTimeString().split(' ')[0];
      const path = 'unknown-' + label + '.jpg';

      const originalBuffer = extractFacesUnknown[i].toBuffer('image/png');

      const resizedBuffer = await sharp(originalBuffer)
        .resize({ width: 200 })
        .jpeg({ quality: 40 })
        .toBuffer();

      singleFaceImages.push(resizedBuffer);

      let greeting;
      try {
        const res = await axios.post(process.env.ENV_TARGET_PORT + '/randomGreeting', { expression });
        greeting = res.data;
      } catch (error) {
        console.log('Error during random greeting message from db', error.message);
        greeting = 'error';
      }

      dataForDatabase.push({
        name: 'unknown', expression, age: data.age, gender: data.gender, date, time, path, env_path: envFile.name, greeting,
      });

    }));

    if (dataForDatabase.length > 0) {
      await saveUnknownData(dataForDatabase, singleFaceImages, envFile);
    }

    return;
  }

  try {
    const labeledFaceDescriptors = await Promise.all(labels.map(label =>
      new faceapi.LabeledFaceDescriptors(label, [descriptions.find(d => d.label === label).descriptions])
    ));
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.5);

    await Promise.all(unknownData.map(async (data, i) => {
      const faceMatch = faceMatcher.findBestMatch(data.descriptor);
      if (faceMatch.label === 'unknown') {
        const label = Date.now().toString() + i.toString();
        const newDescriptions = new Float32Array(data.descriptor);
        unknownCache.set(label, newDescriptions);
        descriptions.push({ label, descriptions: newDescriptions });

        // prepairing data
        const expression = Object.entries(data.expressions).reduce((a, b) => a[1] > b[1] ? a : b)[0];
        const now = new Date();
        const thailandTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
        const parts = thailandTime.toISOString().split('T')[0].split('-');
        const date = `${parts[2]}/${parts[1]}/${parts[0]}`;
        const time = new Date().toTimeString().split(' ')[0];
        const path = 'unknown' + label + '.jpg';

        const originalBuffer = extractFacesUnknown[i].toBuffer('image/png');

        const resizedBuffer = await sharp(originalBuffer)
          .resize({ width: 200 })
          .jpeg({ quality: 40 })
          .toBuffer();

        singleFaceImages.push(resizedBuffer);

        let greeting;
        try {
          const res = await axios.post(process.env.ENV_TARGET_PORT + '/randomGreeting', { expression });
          greeting = res.data;
        } catch (error) {
          console.log('Error during random greeting message from db', error.message);
          greeting = 'error';
        }

        dataForDatabase.push({
          name: 'unknown', expression, age: data.age, gender: data.gender, date, time, path, env_path: envFile.name, greeting,
        });

        console.log('Create new unknown user id', label);
      } else {
        unknownCache.ttl(faceMatch.label, 30);

        console.log('The unknown user matching with id', faceMatch.label);
      }

    }));
    if (dataForDatabase.length > 0) {
      saveUnknownData(dataForDatabase, singleFaceImages, envFile);
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = { prepairData };