import React, { useState, useEffect } from 'react';
import NavBar from './nav/NavBar';
import { Container, InputGroup, Form, Button, Table } from 'react-bootstrap';
import ViewCSS from './style/ViewEmp.module.css';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
// import { useHistory ,} from 'react-router-dom';

function ViewEmp() {

  const { name } = useParams();
  // console.log(name)
  const styletest = {
    textAlign: "center"
  }
  const [imageUrls, setImageUrls] = useState([]);
  const [detectt, setDetect] = useState([])
  useEffect(() => {
    const getDetect = async () => {
      try {
        const res = await axios.get(import.meta.env.VITE_API + `/getEmpDetect/${name}`);
        if (Array.isArray(res.data)) {
          setDetect(res.data);
        } else {
          console.error('Data received is not an array:', res.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    getDetect()
  }, [name]);
  const getImagePath = (single_img) => {
    console.log(single_img)
    return import.meta.env.VITE_API + `/labeled_images/${single_img}`;
  };



  return (
    <div>
      <NavBar />

      <h1 style={styletest}>History</h1>
      <Container>
        <div className={ViewCSS.table}>
          <Table hover>
            <thead>
              <tr>
                <th></th>
                {/* <th>Name</th>  */}
                <th>Expression</th>
                <th>Date</th>
                <th>Time</th>
                <th>Image</th>
              </tr>
            </thead>
            <tbody>
              {detectt.map((data, key) => (

                <tr key={key}>
                  <td>{key + 1}</td>
                  <td>{data.expression}</td>
                  <td>{data.date}</td>
                  <td>{data.time}</td>
                  <td><img width={100} height={100} style={{ borderRadius: '0.5rem' }} src={getImagePath(data.path)} alt="" /></td>
                </tr>
              ))}
            </tbody>
          </Table>

        </div>
      </Container>
    </div>
  );
}

export default ViewEmp;