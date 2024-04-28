const NodeCache = require("node-cache");
// const db = require('./database/mysql.js');
const { saveKnownData } = require('./saveKnownData.js')
const sharp = require('sharp');
const axios = require('axios');
require('dotenv').config();

const knowCache = new NodeCache({ stdTTL: 30, checkperiod: 30 });

async function prepairData(results, extractFaces, envFile) {

    let responseData = [];
    let dataForDatabase = []
    let singleFaceImages = [];

    const resizedEnvFileBuffer = await sharp(envFile.data)
        .resize({ width: 200 })
        .jpeg({ quality: 30 })
        .toBuffer();

    envFile.data = resizedEnvFileBuffer;

    await Promise.all(results.map(async ({ detection: { expressions, age, gender }, faceMatch: { label } }, index) => {
        if (!knowCache.has(label)) {
            knowCache.set(label, true, 30);

            const now = new Date();
            const thailandTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
            const parts = thailandTime.toISOString().split('T')[0].split('-');
            const date = `${parts[2]}/${parts[1]}/${parts[0]}`;

            const time = new Date().toTimeString().split(' ')[0];

            const expression = Object.entries(expressions).reduce((a, b) => a[1] > b[1] ? a : b)[0];

            const path = label + '-' + Date.now() + index + '.jpg';

            const originalBuffer = extractFaces[index].toBuffer('image/png');

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
                name: label, expression, age, gender, date: date, time, path: path, env_path: envFile.name, greeting,
            });

            responseData.push({
                name: label, expression, greeting, singleFace: resizedBuffer
            });
        }
        else {
            knowCache.ttl(label, 30);
        }
    }));

    if (dataForDatabase.length > 0) {
        await saveKnownData(dataForDatabase, singleFaceImages, envFile);
    }

    return responseData.length ? responseData : [];
};

module.exports = { prepairData };