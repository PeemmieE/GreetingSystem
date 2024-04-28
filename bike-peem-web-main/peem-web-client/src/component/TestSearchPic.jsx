import React, { useRef, useEffect, useState } from 'react';
import NavBar from './nav/NavBar';
import axios from 'axios';
import './style/testSearchPicStyles.css';
import * as faceapi from 'face-api.js';
import { Container, Pagination, InputGroup, Form, Button, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faXmark, faMagnifyingGlass, faQuestion, faLock, faChartLine, faUser, faFaceSmile } from '@fortawesome/free-solid-svg-icons'
export default function TestSearchPic() {

  const imageUploadRef = useRef();
  const canvasRef = useRef();
  const [faceMatcher, setFaceMatcher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [picpng, setpicPNG] = useState(false);
  const [data, setData] = useState([])
  const [dataDummy, setDataDummy] = useState([])
  const [namefile, setNameFile] = useState([])
  // const [noface,setNoFace] = useState(null)
  const [text, setText] = useState(true)
  const [faceMatcherUnk, setFaceMatcherUnk] = useState(null)
  const [newIMG, setNewIMG] = useState(null)
  useEffect(() => {
    const MODEL_URL = '/models';
    setLoading(true);

    Promise.all([
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    ]).then(async () => {
      const labelsData = await axios.get(import.meta.env.VITE_API + '/api/labels');
      // setLabels(labelsData.data);
      const labeledFaceDescriptors = await loadLabeledImage(labelsData.data);
      // const labelunknown = await loadLabeledUnk()

      // const matcherunk = new faceapi.FaceMatcher(labelunknown, 0.59);
      const matcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.59);
      // console.log(matcher)
      setFaceMatcher(matcher);
      // setFaceMatcherUnk(matcherunk)

      setLoading(false);
    }).catch(error => {
      console.error("Error loading models", error);
      setLoading(false);
    });
  }, []);

  const getImagePath = (dname, single_img) => {
    if (dname == 'unknown') {
      return import.meta.env.VITE_API + `/api/detectedSingleFace/${single_img}`;
    } else {
      return import.meta.env.VITE_API + `/getDetectedSingleFaceKnown/${single_img}`;
    }
  };
  const getImagePathEnv = (single_img) => {
    return import.meta.env.VITE_API + `/getENV/${single_img}`;
  };

  async function searchInDetectedSingleFaceKnown(detectedDescriptor) {
    // console.log('??')
    // console.log(detectedDescriptor)
    const baseUrl = import.meta.env.VITE_API + '/api/detectknown';
    const files = await getFilesInDirectoryKnown();
    // console.log(files)
    let matches = [];
    const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.1, scoreThreshold: 0.5 })
    for (const file of files) {
      const img = await faceapi.fetchImage(`${baseUrl}/${file}`);
      // console.log(file)
      const singleResult = await faceapi.detectSingleFace(img, options).withFaceLandmarks().withFaceDescriptor();
      // console.log('64')
      // console.log(singleResult)
      if (singleResult) {
        const distance = faceapi.euclideanDistance(detectedDescriptor, singleResult.descriptor);
        // console.log('Before: '+distance)
        if (distance < 0.6) {
          // console.log('After: '+distance)
          matches.push({ distance, file });
        }
      }
    }
    console.log(matches)

    matches.sort((a, b) => a.distance - b.distance);

    const pngFiles = matches
      .filter(match => match.file && match.file.endsWith('.jpg'))
      .map(match => {
        // namefile.push(match.file)
        setNameFile(previousNames => [...previousNames, match.file]);
        // console.log('WHYYYYYY' + match.file)
        // Extract just the filename from the URL path
        const filename = match.file.split('/').pop(); // Assuming match.file is a string with the file path
        console.log(filename)
        return filename;
      });

    return pngFiles.length > 0 ? pngFiles : [];
  }

  async function searchInDetectedSingleFace(detectedDescriptor) {
    // console.log('??')
    // console.log(detectedDescriptor)
    const baseUrl = import.meta.env.VITE_API + '/api/detectedSingleFace';
    const files = await getFilesInDirectory();
    // console.log(files)
    let matches = [];
    const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.1, scoreThreshold: 0.5 })
    for (const file of files) {
      const img = await faceapi.fetchImage(`${baseUrl}/${file}`);
      // console.log(file)
      const singleResult = await faceapi.detectSingleFace(img, options).withFaceLandmarks().withFaceDescriptor();
      // console.log('64')
      // console.log(singleResult)
      if (singleResult) {
        const distance = faceapi.euclideanDistance(detectedDescriptor, singleResult.descriptor);
        console.log(distance)
        if (distance < 0.6) {
          matches.push({ distance, file });
        }
      }
    }

    matches.sort((a, b) => a.distance - b.distance);

    const pngFiles = matches
      .filter(match => match.file && match.file.endsWith('.jpg'))
      .map(match => {
        // namefile.push(match.file)
        setNameFile(previousNames => [...previousNames, match.file]);
        // console.log('WHYYYYYY' + match.file)
        // Extract just the filename from the URL path
        const filename = match.file.split('/').pop(); // Assuming match.file is a string with the file path
        return filename;
      });

    return pngFiles.length > 0 ? pngFiles : [];
  }

  async function getFilesInDirectory() {
    try {
      const response = await axios.get(import.meta.env.VITE_API + '/api/detectedSingleFace/files');
      // console.log(response.data)
      return response.data;
    } catch (error) {
      console.error("Error fetching the list of files", error);
      return [];
    }
  }
  async function getFilesInDirectoryKnown() {
    try {
      const response = await axios.get(import.meta.env.VITE_API + '/api/detectedSingleFaceKnown/files');
      // console.log(response.data)
      return response.data;
    } catch (error) {
      console.error("Error fetching the list of files", error);
      return [];
    }
  }

  async function getFilePicKnown(path) {
    try {
      const response = await axios.get(import.meta.env.VITE_API + '/api/known');
      // console.log(response.data)
      return response.data;
    } catch (error) {
      console.error("Error fetching the list of files", error);
      return [];
    }
  }

  const loadLabeledImage = (labelsInfo) => {
    return Promise.all(
      labelsInfo.map(async labelInfo => {
        const { label } = labelInfo;
        const res = await axios.get(import.meta.env.VITE_API + `/getFilePic/${label}`);
        const fileNames = res.data;

        const descriptions = [];
        for (const fileName of fileNames) {
          const img = await faceapi.fetchImage(import.meta.env.VITE_API + `/getImageFolder/${encodeURIComponent(label)}/${fileName}`);
          const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
          if (detections) {
            descriptions.push(detections.descriptor);
          } else {
            console.warn(`No face detected in image ${fileName}`);
          }
        }
        // Only return LabeledFaceDescriptors with at least one descriptor
        if (descriptions.length > 0) {
          return new faceapi.LabeledFaceDescriptors(label, descriptions);
        } else {
          console.warn(`No descriptors created for label ${label}`);
          return null;
        }
      })
    ).then(labeledDescriptors => labeledDescriptors.filter(ld => ld)); // Filter out any nulls
  };

  const filterbydate = async () => {
    try {
      const startDate = document.getElementById('d1').value;
      const stopDate = document.getElementById('d2').value;
      if (!startDate) {
        console.log('No start date provided');
        return;
      }
      if (startDate > stopDate && stopDate) {
        alert('Start date cannot be greater than end date.');
        console.log('ngo');
        return
      }
      // console.log('Before Set Date: '+dataDummy)
      setDataDummy([])
      setData([])
      console.log('TETSTTSTSTS: ' + dataDummy)
      const url = new URL(import.meta.env.VITE_API + `/getEmpDetectModel/${namefile}`);
      url.searchParams.append('dateStart', startDate);
      if (stopDate) {
        url.searchParams.append('dateStop', stopDate);
      }

      const res = await axios.get(url.toString());

      console.log("res.data is: " + res.data)
      setDataDummy(res.data)
      setData(res.data)
    } catch (err) {
      console.log('Error fetching data:', err.message);
    }
  };
  const handleImageUpload = async event => {

    if (event.target.files && event.target.files.length > 0 && faceMatcher) {
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(event.target.files[0].type)) {

        alert('Invalid file type. Please select a JPG or PNG image.');
        // setLoading(false)
        setLoading(false)
        return
      }
      setpicPNG(true)
      setData([])
      setDataDummy([])
      const imgFile = event.target.files[0];
      const img = await faceapi.bufferToImage(imgFile);
      const canvas = canvasRef.current;
      const desiredWidth = 700;
      const desiredHeight = 527;
      const aspectRatio = img.width / img.height;
      if (img.width > img.height) {
        canvas.width = desiredWidth;
        canvas.height = desiredWidth / aspectRatio;
      } else {
        canvas.width = desiredHeight * aspectRatio;
        canvas.height = desiredHeight;
      }
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const detections = await faceapi.detectAllFaces(img)
        .withFaceLandmarks()
        .withFaceDescriptors();
      if (detections.length === 0) {
        window.alert('No face detected in the image. Please upload an image with a face.');
        return;
      }
      if (detections.length > 0) {
        // setNoFace(true)
        const resizedDetections = faceapi.resizeResults(detections, {
          width: canvas.width,
          height: canvas.height,
        });
        resizedDetections.forEach(async detection => {
          const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
          // console.log(detection.descriptor)
          if (bestMatch.distance > 0.59) {
            // const imageFromDetected = faceMatcherUnk.findBestMatch(detection.descriptor);
            const imageFromDetected = await searchInDetectedSingleFace(detection.descriptor);

            // console.log(detection.descriptor)
            if (imageFromDetected) {
              console.log('Unknown Matched Image:', imageFromDetected);
              setpicPNG(imageFromDetected)
              console.log(imageFromDetected)
              // setNameFile(previousNames => [...previousNames, imageFromDetected.toString()]);
              saveMatchedName(detection.descriptor, imageFromDetected);
            } else {
              console.log('not found')
            }

          } else {
            console.log('Known Face Matched:', bestMatch.toString());
            namefile.push(bestMatch.toString())
            const imageFromDetected = await searchInDetectedSingleFaceKnown(detection.descriptor);
            // setNameFile(bestMatch)
            if (imageFromDetected) {
              // console.log('Unknown Matched Image:', imageFromDetected);
              setpicPNG(imageFromDetected)
              // console.log(imageFromDetected)
              // setNameFile(previousNames => [...previousNames, imageFromDetected.toString()]);
              saveMatchedName(detection.descriptor, imageFromDetected);
            } else {
              console.log('not found')
            }
            // saveMatchedName(detection.descriptor, [bestMatch]);
            // console.log('best match : ' + bestMatch)
          }
          // console.log('NFNFNNFNF'+namefile)
          const box = detection.detection.box;
          const drawBox = new faceapi.draw.DrawBox(box, { label: bestMatch.toString() });
          drawBox.draw(canvas);
        });
        setDataDummy(data)
      }



      // console.log(dataDummy)


    }
    setLoading(true);
    setText(false)
  };

  let fetchPromises = [];
  async function fetchAndProcessImage(baseUrl, imagePath, detectedDescriptor) {
    const img = await faceapi.fetchImage(`${baseUrl}/${imagePath}`);
    const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.1, scoreThreshold: 0.1 });
    const singleResult = await faceapi.detectSingleFace(img, options).withFaceLandmarks().withFaceDescriptor();
  
    if (singleResult) {
      const distance = faceapi.euclideanDistance(detectedDescriptor, singleResult.descriptor);
      if (distance < 0.59) {
        console.log('Match found:', imagePath);
        return imagePath; // Return the path if it's a match.
      }
    }
  }
  
  const saveMatchedName = async (detectedDescriptor, matches) => {
    const baseUrl = import.meta.env.VITE_API + '/api/detectknown';
    let newCombinedData = [];
    // console.log(matches)
  
    try {
      // for (const match of matches) {
        // const name = match.toString().split(' ')[0];
        console.log(matches)
        // if (matches.includes('.jpg')) {
          const result = await axios.get(import.meta.env.VITE_API+`/getEmpDetectModel/${matches}`)
          console.log(result.data)
          newCombinedData.push(result);
          // newCombinedData.push(await axios.get(import.meta.env.VITE_API+`/getEmpDetect/${match}`));
        // } else {
          // const { data } = await axios.get(`${import.meta.env.VITE_API}/detectknown/${name}`);
          
          // for (const item of data) {
          //   const matchedPath = await fetchAndProcessImage(baseUrl, item.path, detectedDescriptor);
            
          //   if (matchedPath) {
          //     const result = await axios.get(`${import.meta.env.VITE_API}/getEmpDetect/${matchedPath}`);
          //     newCombinedData.push(result);
          //   }
          // }
        // }
      // }
      // console.log(newCombinedData)
  
      // Process newCombinedData to update state or perform further actions
      const combinedData = newCombinedData.map(res => res.data).flat();
      // console.log(combinedData)
      setData(prevData => [...prevData, ...combinedData]);
  
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };


  // const saveMatchedNamed = async (detectedDescriptor, matches) => {

  //   // console.log(detectedDescriptor)
  //   try {

  //     for (const match of matches) {
  //       // console.log('Match is'+match)
  //       // setCopyname(prevData => [...prevData, ...match]);
  //       const name = match.toString().split(' ')[0];
  //       if (name.includes('.jpg')) {
  //         fetchPromises.push(axios.get(import.meta.env.VITE_API + `/getEmpDetect/${name}`));
  //       } else {
  //         const result = await axios.get(import.meta.env.VITE_API + `/getEmpDetect/${name}`)
         
  //         result.data.forEach(async (item) => {
  //           console.log(item.path);
  //           //give api to get folder from server.js by item.path in
  //           const baseUrl = import.meta.env.VITE_API + '/api/detectknown';
  //           const img = await faceapi.fetchImage(`${baseUrl}/${item.path}`);
  //           // const getImg = getFilePicKnown(item.path)
  //           const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.1, scoreThreshold: 0.1 })
  //           const singleResult = await faceapi.detectSingleFace(img, options).withFaceLandmarks().withFaceDescriptor();
  //           if (singleResult) {
  //             // console.log('singleTEST')
  //             const distance = faceapi.euclideanDistance(detectedDescriptor, singleResult.descriptor);
  //             // console.log('distance')
  //             // console.log(distance)
  //             if (distance < 0.59) {
  //               console.log('MUST BE !')
  //               console.log(item)
  //               fetchPromises.push(axios.get(import.meta.env.VITE_API + `/getEmpDetect/${item.path}`));
  //               console.log(fetchPromises)
  //             }

  //           }
  //         });
  //       }

  //       // console.log(result.data.)
  //       // fetchPromises.push(axios.get(import.meta.env.VITE_API + `/getEmpDetect/${name}`));
  //     }
  //     console.log(fetchPromises)

  //     const results = await Promise.all(fetchPromises);
  //     const newCombinedData = results.reduce((acc, res) => {
  //       if (Array.isArray(res.data) && res.data.length > 0) {
  //         setDataDummy(prevData => [...prevData, ...res.data])
  //         // console.log(res)
  //         return acc.concat(res.data);
  //       }
  //       return acc;
  //     }, []);
  //     setData(prevData => [...prevData, ...newCombinedData]);
  //   } catch (err) {
  //     console.error('Error fetching data:', err);
  //   }
  // };

  const testdelete = () => {
    setNameFile([])
    setDataDummy([])
    // setpicPNG([])
    setData([])
    setpicPNG(false)
    setLoading(false);
  }
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(4);
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = data.slice(indexOfFirstEmployee, indexOfLastEmployee);


  const paginate = (pageNumber) => setCurrentPage(pageNumber);


  return (
    <>
      <NavBar />
      <Container>
        <div className="testSearchPicContainer">
          <div className="fileInputContainer">
            <h2 className="testSearchPicTitle">Search By Image System</h2>
            {loading ? (
              <p className="testSearchPicLoading">{text ? 'Loading model....' : 'กดปุ่มกากบาทเพื่ออัพรูปใหม่'}</p>
            ) : (
              <input
                type="file"
                ref={imageUploadRef}
                onChange={handleImageUpload}
                className="testSearchPicInput"
              />
            )}</div>
        </div>
        {picpng ? (
          <div className="contentContainer">

            <canvas ref={canvasRef} className="testSearchPicCanvas" />

            <div className="tableContainer">
              <label>Date Length:</label>
              <div>
                <input style={{ width: '25%' }} id='d1' type='date' />
                <label> -</label>
                <input style={{ width: '25%' }} id='d2' type='date' />
                <Button onClick={filterbydate} style={{ width: '10%', marginLeft: '1rem' }}> <FontAwesomeIcon icon={faSearch} /></Button>
                <Button onClick={testdelete} style={{ width: '10%', background: 'red', marginLeft: '1rem' }}> <FontAwesomeIcon icon={faXmark} /></Button>

              </div>

              <Table style={{ marginTop: '3rem' }} hover>
                <thead>
                  <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Expression</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Image</th>
                    <th>Envoriment</th>
                  </tr>
                </thead>

                {currentEmployees.length > 0 ? (

                  <tbody>
                    {currentEmployees.map((item, key) => (
                      <tr key={key}>
                        <td>{(currentPage * 4 - (4 - key)) + 1}</td>
                        <td>{item.name}</td>
                        <td>{item.expression}</td>
                        <td>{item.date}</td>
                        <td>{item.time}</td>
                        <td><img width={100} height={100} style={{ borderRadius: '0.5rem' }} src={getImagePath(item.name, item.path)} alt="" /></td>
                        <td><img width={100} height={100} style={{ borderRadius: '0.5rem' }} src={getImagePathEnv(item.env_path)} alt="" /></td>
                      </tr>
                    ))}
                  </tbody>

                ) : (
                  <tbody>
                    <tr>
                      <td colSpan="7">ไม่พบข้อมูล</td>
                    </tr>
                  </tbody>
                )}
              </Table>
              <div className="pagination-container">
                <Pagination>
                  {[...Array(Math.ceil(data.length / employeesPerPage)).keys()].map(number => (
                    <Pagination.Item key={number + 1} active={number + 1 === currentPage} onClick={() => paginate(number + 1)}>
                      {number + 1}
                    </Pagination.Item>
                  ))}
                </Pagination>
              </div>
            </div>
          </div>
        ) : (
          <h2 style={{ textAlign: 'center' }}></h2>
        )}

      </Container >
    </>
  );

}
