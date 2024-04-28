import { useState, useRef } from 'react';
import { Button, Container } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from "react-router-dom";
import NavBar from '../nav/NavBar';
import Cropper from 'react-cropper';
import * as faceapi from 'face-api.js';
import axios from 'axios';

import './Modal.css'
// import NewCollectionCSS from '../style/NewCollection.module.css';
function Modall() {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [fileoff, setFileoff] = useState(null);
    const [folderName, setFolderName] = useState('');
    const [image, setImage] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null);
    const cropperRef = useRef(null);
    const [test, setTest] = useState([])
    const navigate = useNavigate()

    useState(() => {
        const MODEL_URL = '/models';
        Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        ])
        const getlabel = async () => {
            try {
                const res = await axios.get(import.meta.env.VITE_API + '/api/labels');
                setTest(res.data);
                // console.log(res.data);
            }
            catch (err) {
                console.log(err);
            }
        }
        const getOff = async () => {
            try {
                const res = await axios.get(import.meta.env.VITE_API + '/checknameOff');
                setFileoff(res.data);
                // console.log(res.data);
            }
            catch (err) {
                console.log(err);
            }
        }
        getlabel();
        getOff()
    }, [test])

    const handleFileChange = (event) => {
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
            setShow(false)
            return
          }
        }
      };
      
    // const checkFace = async () =>{
    //     const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
    // }
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
        const imageElement = cropperRef.current;
        const cropper = imageElement?.cropper;
        const croppedCanvas = cropper.getCroppedCanvas();
        const faceDetections = await faceapi.detectAllFaces(croppedCanvas);
        if (faceDetections.length === 0) {
            window.alert('No face detected in the image. Please upload an image with a face.');
            return;
        } else if (faceDetections.length > 1) {
            window.alert('More than one face detected in the image. Please upload an image with only one face.');
            return;
        }

        const isFolderNameDuplicate = test.some(testItem => folderName === testItem.label);
        if (isFolderNameDuplicate) {
            window.alert('ชื่อ Folder ซ้ำ');
            return; // หยุดการทำงานหากพบชื่อซ้ำ
        }
        const isFolderNameDuplicateOFF = fileoff.some(testItem => folderName === testItem.label);
        if (isFolderNameDuplicateOFF) {
            window.alert('ชื่อ Folder ซ้ำ');
            return; // หยุดการทำงานหากพบชื่อซ้ำ
        }
        createEmployeeDB();
        createEmployeeFolder();
        
        // go to <Album />

        navigate('/album')

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
        const date = new Date().toISOString().slice(0, 10);
        const response = await fetch(croppedImage);
        const blob = await response.blob();
        const formData = new FormData();
        formData.append('croppedImage', blob, 'image.jpg'); // Ensure 'croppedImage' matches the server's expected field name
        formData.append('folderName', folderName);
        formData.append('imgname', [folderName + date + '.jpg']);
        formData.append('imageName', [folderName + date + '.jpg']);
        console.log(Array.from(formData));

        //for kiosk
        try {
            const response = await axios.post(import.meta.env.VITE_KIOSK_API + '/addLabelImage', formData);
            console.log('Server response:', response.data);
        } catch (error) {
            console.error('Error:', error);
        }

        //for web
        try {
            const response = await axios.post(import.meta.env.VITE_API + '/updateImageFolder', formData);
            console.log('Server response:', response.data);
        } catch (error) {
            console.error('Error:', error);
        }

    };
    const onCrop = () => {
        const imageElement = cropperRef.current;
        const cropper = imageElement?.cropper;
        setCroppedImage(cropper.getCroppedCanvas({
            width: 300, // Set the width of the cropped canvas
            height: 300, // Set the height of the cropped canvas
            minWidth: 100,
            minHeight: 100,
            maxWidth: 4096,
            maxHeight: 4096,
            fillColor: 'transparent', // Changed from '#fff' to 'transparent'
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
        }).toDataURL('image/jpg')); // Specify the image format if it's not already PNG

        setShow(false)
    };
    return (
        <>
            <NavBar />
            <Container>

                <div className='all'>
                    <div className='size'>
                        <div className="input-group mb-3">
                            <h3 htmlFor="">Name , folderName</h3>
                            <input
                                type="text"
                                placeholder="Name"
                                value={folderName}
                                onChange={(e) => setFolderName(e.target.value)}
                                aria-label="Recipient's username"
                                aria-describedby="basic-addon2"
                                required />
                        </div>

                        <Button variant="primary" className='btn' onClick={handleShow}>
                            Add Image
                        </Button>

                        <Modal show={show} onHide={handleClose}>
                            <Modal.Header closeButton>
                                <Modal.Title>Upload Image</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <input type="file" onChange={handleFileChange} />

                                <div className='img-container'>
                                    {image && (
                                        <Cropper
                                            src={image}
                                            className='cropper-container'
                                            initialAspectRatio={1}
                                            guides={false}
                                            ref={cropperRef}
                                        />
                                    )}
                                </div>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleClose}>
                                    Close
                                </Button>
                                <Button variant="primary" onClick={onCrop}>
                                    Crop
                                </Button>
                            </Modal.Footer>
                        </Modal>
                        {croppedImage && (
                            <div>
                                <img src={croppedImage} className='croppedImage' alt="Cropped" />
                            </div>
                        )}
                        <button style={{
                            marginTop: '20px',
                            marginBottom: '20px',
                            border: '0.3px solid gray'
                        }}
                            onClick={handleUpload}>Upload</button>
                    </div>
                </div>
            </Container>
        </>
    );
};

export default Modall