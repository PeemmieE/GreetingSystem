import React, { useState, useEffect } from 'react';
import NavBar from './nav/NavBar';
import { Container, InputGroup, Form, Button, Table } from 'react-bootstrap';
import AlbumCSS from './style/Album.module.css';
import axios from 'axios';
import { useParams , useNavigate } from 'react-router-dom';

function DeleteEmp() {
  const { empID } = useParams();
  const navigate = useNavigate()
  if(!empID){
    //Go to ViewEmp.jax
  }
  const [detail, setDetail] = useState(null);
  
  useEffect(() => {
    const getEmployee = async () => {
      try {
        const res = await axios.get(import.meta.env.VITE_API + `/getEmployeeDetail/${empID}`);
        setDetail(res.data);
        console.log(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    getEmployee();
  }, [empID]);

  const handleDelete = async () => {
    // try {
    //   await axios.delete(import.meta.env.VITE_API + `/deleteEmployee/${empID}`);
    //   // Optionally, you can refresh the employee list or perform any other actions
    //   navigate('/album');
    // } catch (error) {
    //   console.error('Error deleting employee:', error);
    // }

  };

  if (!detail) {
    return <div><NavBar />May be it has a BUG!!</div>;
  }

  return (
    <div>
      <NavBar />
      <Container>
      {/* Accessing properties directly since it's a single object */}
      <p>Do you want to Delete {detail.employee_name}?</p>
      {/* Add more details as needed */}
      <Button onClick={handleDelete} variant='success' style={{ width: '80%' }}>Yes</Button>
      <Button href={`/album`} variant='success' style={{ width: '80%' ,backgroundcolor: 'red'}}>No</Button>
      </Container>
    </div>
  );
}

export default DeleteEmp;