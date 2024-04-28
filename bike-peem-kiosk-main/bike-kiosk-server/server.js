const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const faceApiService = require("./faceapiService.js");
const path = require('path');
const fs = require('fs');

require('dotenv').config();

const app = express();
const port = process.env.ENV_PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(fileUpload({ createParentPath: true }));

app.post("/prediction", async (req, res) => {

  if (!req.files || !req.files.file) {
    return res.status(400).send('No files were uploaded.');
  }

  const file = req.files.file;
  const result = await faceApiService.detect(file);

  res.json(result);
});

//delete image in folder
app.delete('/deleteLabelImage', (req, res) => {

  const { labelName, imageName } = req.body;
  const folderName = 'labels/' + labelName;
  const imagePath = path.join(process.cwd(), folderName, imageName);

  fs.unlink(imagePath, (err) => {
    if (err) {
      console.error('Error deleting image');
      return res.status(500).send('Error deleting image');
    }

    fs.readdir(path.join(process.cwd(), folderName), (err, files) => {
      if (err) {
        console.error('Error reading directory:', err);
        return res.status(500).send('Error deleting image');
      }

      if (files.length === 0) {
        fs.rmdir(path.join(process.cwd(), folderName), (err) => {
          if (err) {
            console.error('Error deleting folder:', err);
            return res.status(500).send('Error deleting image');
          }
          console.log('Folder deleted successfully');
          res.send('Image and folder deleted successfully');
        });
      } else {
        console.log('Image deleted successfully');
        res.send('Image deleted successfully');
      }
    });
  });
  faceApiService.setLabeledFaceDescriptors(null)
});

//deete folder in labels 
app.post('/deleteLabelFolder', async (req, res) => {

  const { folderName } = req.body;

  const folderPath = path.join(process.cwd(), 'labelsOff', folderName);

  try {
    fs.rm(folderPath, { recursive: true }, (err) => {
      if (err) {
        console.error(err.message);
        return;
      }
    })
  } catch (error) {
    console.log('Error on kiosk server side at deleteLabelFolder Api');
  }

  faceApiService.setLabeledFaceDescriptors(null)
});

//add image in folder 
app.post('/addLabelImage', async (req, res) => {

  const uploadedImage = req.files.croppedImage;
  const { folderName, imageName } = req.body;

  const uploadPath = path.join(__dirname, 'labels', folderName, imageName);
  const directoryPath = path.join(__dirname, 'labels', folderName);

  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }

  uploadedImage.mv(uploadPath, function (err) {
    if (err) {
      return res.status(500).send(err);
    }
    res.send('File uploaded successfully.');

    faceApiService.setLabeledFaceDescriptors(null);
  });
});

//rename folder 
app.post('/renameLabelFolder', (req, res) => {
  const { oldLabelName, newLabelName } = req.body;

  console.log(oldLabelName);
  console.log(newLabelName);

  const oldPath = path.join(process.cwd(), 'labels', oldLabelName);
  const newPath = path.join(process.cwd(), 'labels', newLabelName);

  if (!fs.existsSync(oldPath)) {
    return res.status(404).send('Source label folder not found.');
  }
  if (fs.existsSync(newPath)) {
    return res.status(400).send('A folder with the new label name already exists.');
  }

  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      console.error('Error renaming folder:', err);
      return res.status(500).send('Error renaming label folder');
    }

    console.log(`Label folder renamed successfully from ${oldLabelName} to ${newLabelName}`);
    res.send(`Label folder renamed successfully from ${oldLabelName} to ${newLabelName}`);

    faceApiService.setLabeledFaceDescriptors(null);
  });
});

//trasform folder to labelsOff
// app.post('/labelsOff', (req, res) => {
//   const { labelName } = req.body;
//   const sourceDir = path.join(process.cwd(), 'labels', labelName);
//   const destDir = path.join(process.cwd(), 'labelsOff', labelName);

//   try {
//     if (!fs.existsSync(sourceDir)) {
//       return res.status(404).send('Source folder not found.');
//     }

//     if (!fs.existsSync(path.dirname(destDir))) {
//       fs.mkdirSync(path.dirname(destDir), { recursive: true });
//     }

//     fs.rename(sourceDir, destDir, (err) => {
//       if (err) {
//         console.error('Error moving folder:', err);
//         return res.status(500).send('Error moving folder');
//       }
//       res.send('Folder moved to labelsOff successfully.');
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('An error occurred');
//   }
//   faceApiService.setLabeledFaceDescriptors(null);
// });

// //transfrom folder to label
// app.post('/labelsOn', (req, res) => {
//   const { labelName } = req.body;
//   const sourceDir = path.join(process.cwd(), 'labelsOff', labelName);
//   const destDir = path.join(process.cwd(), 'labels', labelName);

//   try {
//     if (!fs.existsSync(sourceDir)) {
//       return res.status(404).send('Source folder not found.');
//     }

//     if (!fs.existsSync(path.dirname(destDir))) {
//       fs.mkdirSync(path.dirname(destDir), { recursive: true });
//     }

//     fs.rename(sourceDir, destDir, (err) => {
//       if (err) {
//         console.error('Error moving folder:', err);
//         return res.status(500).send('Error moving folder');
//       }
//       res.send('Folder moved to labels successfully.');
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('An error occurred');
//   }
//   faceApiService.setLabeledFaceDescriptors(null)
// });

//common
app.get('/', (req, res) => {
  res.json('Face API server started !!!');
});

app.listen(port, () => {
  console.log("Server running at http://localhost:" + port);
});

//add
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  let entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    entry.isDirectory() ? copyDir(srcPath, destPath) : fs.copyFileSync(srcPath, destPath);
  }
}

function deleteDir(dir) {
  let entries = fs.readdirSync(dir, { withFileTypes: true });

  for (let entry of entries) {
    let entryPath = path.join(dir, entry.name);

    entry.isDirectory() ? deleteDir(entryPath) : fs.unlinkSync(entryPath);
  }
  fs.rmdirSync(dir);
}

app.post('/labelsOff', (req, res) => {
  const { labelName } = req.body;
  const sourceDir = path.join(process.cwd(), 'labels', labelName);
  const destDir = path.join(process.cwd(), 'labelsOff', labelName);

  try {
    if (!fs.existsSync(sourceDir)) {
      return res.status(404).send('Source folder not found.');
    }

    if (!fs.existsSync(path.dirname(destDir))) {
      fs.mkdirSync(path.dirname(destDir), { recursive: true });
    }

    copyDir(sourceDir, destDir);
    deleteDir(sourceDir);

    res.send('Folder moved to labelsOff successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }

  faceApiService.setLabeledFaceDescriptors(null);
});

app.post('/labelsOn', (req, res) => {
  const { labelName } = req.body;
  const sourceDir = path.join(process.cwd(), 'labelsOff', labelName);
  const destDir = path.join(process.cwd(), 'labels', labelName);

  try {
    if (!fs.existsSync(sourceDir)) {
      return res.status(404).send('Source folder not found.');
    }

    if (!fs.existsSync(path.dirname(destDir))) {
      fs.mkdirSync(path.dirname(destDir), { recursive: true });
    }

    // Copy then delete
    copyDir(sourceDir, destDir);
    deleteDir(sourceDir);

    res.send('Folder moved to labels successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }

  faceApiService.setLabeledFaceDescriptors(null);
});