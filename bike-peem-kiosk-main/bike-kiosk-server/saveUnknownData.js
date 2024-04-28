// const db = require('./database/mysql.js');
const axios = require('axios');
require('dotenv').config();

const saveUnknownData = async (dataForDatabase, singleFaceImages, environmentImage) => {

    let setOfImagesName = [];

    // const insertQuery = `
    //     INSERT INTO face_detection 
    //     (name, expression, age, gender, date, time, path, env_path, greeting) 
    //     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    try {
        await Promise.all(dataForDatabase.map(async item => {
            // await db.query(insertQuery, [
            //     item.name, item.expression, item.age, item.gender, item.date, item.time, item.path, item.env_path, item.greeting
            // ]);
            setOfImagesName.push(item.path);
        }));
    }
    catch (error) {
        console.error('Error during insert known data to database', error.message);
    }

    //sent image to localhost 2484
    try {
        const res = await axios.post(process.env.ENV_TARGET_PORT + '/receiveKioskUnknownFaceImages', { singleFaceImages, setOfImagesName, environmentImage });
    } catch (error) {
        console.log(error.message);
    }

    //
    try {
        const res = await axios.post(process.env.ENV_TARGET_PORT + '/receiveKioskFaceData', { faceData: dataForDatabase });
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    saveUnknownData
};