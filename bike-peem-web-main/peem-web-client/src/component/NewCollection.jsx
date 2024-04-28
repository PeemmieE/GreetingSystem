import React, { useState, useRef, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import axios from 'axios';
import NavBar from './nav/NavBar';
import NewCollectionCSS from './style/NewCollection.module.css';
import Cropper from 'react-cropper';

import 'cropperjs/dist/cropper.css';

const NewCollection = () => {
  const [file, setFile] = useState(null);
  const [folderName, setFolderName] = useState('');
  const [image, setImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const cropperRef = useRef(null);
  const [test, setTest] = useState([])

  useState(() => {
    const getlabel = async () => {
      try {
        const res = await axios.get(import.meta.env.VITE_API + '/api/labels');
        setTest(res.data);
      }
      catch (err) {
        console.log(err.message);
      }
    }
    getlabel();
  }, [test])

  const onCrop = () => {
    const imageElement = cropperRef.current;
    const cropper = imageElement?.cropper;
    setCroppedImage(cropper.getCroppedCanvas({
      width: 300,
      height: 300,
      minWidth: 100,
      minHeight: 100,
      maxWidth: 4096,
      maxHeight: 4096,
      fillColor: 'transparent',
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    }).toDataURL('image/jpg'));
  };

  const handleFileChange = (event) => {
    console.log('test')
    const file = event.target.files[0];
    if (file) {
      // Check if the file type is jpg or png
      const validTypes = ['image/jpeg', 'image/png'];
      if (validTypes.includes(file.type)) {
        const reader = new FileReader();
        reader.onload = (e) => setImage(e.target.result);
        reader.readAsDataURL(file);
      } else {
        alert('Invalid file type. Please select a JPG or PNG image.');
      }
    }
  };

  const handleUpload = async () => {
    if (!folderName) {
      window.alert('Please enter name.');
      return;
    }
    if (!croppedImage) {
      window.alert('Please select a file before uploading.');
      console.error('Please select a file.');
      return;
    }

    const isFolderNameDuplicate = test.some(testItem => folderName === testItem.label);
    if (isFolderNameDuplicate) {
      window.alert('ชื่อ Folder ซ้ำ');
      return; // หยุดการทำงานหากพบชื่อซ้ำ
    }
    createEmployeeFolder();
    createEmployeeDB();
    // go to <Album />
  };

  const createEmployeeDB = async () => {
    try {
      const res = await axios.post(import.meta.env.VITE_API + `/createEmployee/${folderName}`);
      console.log('create db successfully', res);
    }
    catch (err) {
      console.log('fail to create db', err.message);
    }
  }

  const createEmployeeFolder = async () => {
    const response = await fetch(croppedImage);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append('croppedImage', blob, 'image.jpg'); // Ensure 'croppedImage' matches the server's expected field name
    formData.append('folderName', folderName);
    console.log(Array.from(formData));
    try {
      const response = await axios.post(import.meta.env.VITE_API + '/updateImageFolder', formData, {
        headers: {
          // Axios will set the correct content type for multipart/form-data automatically
        },
      });
      console.log('Server response:', response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <>
      <NavBar />
      <Container>
        <div style={{ marginTop: '50px' }} ></div>
        <div>
          <label htmlFor="">Name, folderName</label>
          <input
            type="text"
            placeholder="Name"
            value={folderName}
            className={NewCollectionCSS.label_input}
            onChange={(e) => setFolderName(e.target.value)}
            required />
        </div>
        <input type="file" onChange={handleFileChange} />

        <button style={{ marginTop: '20px', marginBottom: '20px' }}
          onClick={handleUpload}>Upload</button>
        <div className={NewCollectionCSS['img-container']}>
          {/* This div contains the original image with the cropper */}
          <div>
            <h3>Uncrop Img</h3>
            {image && (
              <Cropper
                src={image}
                className={NewCollectionCSS['cropper-container']}
                initialAspectRatio={1}
                guides={false}
                crop={onCrop}
                ref={cropperRef}
              />
            )}
          </div>

          {/* This div contains the cropped image */}
          {croppedImage && (
            <div>
              <h3>Cropped Image:</h3>
              <img src={croppedImage} className={NewCollectionCSS['croppedImage']} alt="Cropped" />
            </div>
          )}
        </div>
      </Container>
    </>
  );
};

export default NewCollection;