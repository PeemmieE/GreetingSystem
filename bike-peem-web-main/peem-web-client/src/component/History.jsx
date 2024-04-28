import React from 'react'
import NavBar from './nav/NavBar';
import { useState, useRef, useEffect } from "react";
import { Button, Table, Container, Pagination } from 'react-bootstrap';
import axios from 'axios'

export default function History() {
    // url.searchParams.append('dateStart', startDate);
    const [dataa, setDataa] = useState([])
    useEffect(() => {
        const getAllhistoryONOFF = async () => {
            try {
                const url = new URL(import.meta.env.VITE_API + '/getAllhistoryONOFF');
                const res = await axios.get(url.toString());
                setDataa(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        const getUnknown = async () => {
            try {
                const res = await axios.get(import.meta.env.VITE_API + '/getUnknownDetect');
                setCunk(res.data.length);
                console.log(res.data.length);
            }
            catch (err) {
                console.log(err);
            }
        }
        getAllhistoryONOFF()
        // getEmployeeOff()
        // getUnknown()
    }, [])

    // const getImagePathSingle = (single_img) => {
    //     return import.meta.env.VITE_API + `/labeled_images/${single_img}`;
    // };

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
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const [currentPage, setCurrentPage] = useState(1);
    const [employeesPerPage] = useState(5);
    const indexOfLastEmployee = currentPage * employeesPerPage;
    const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
    const currentEmployees = dataa.slice(indexOfFirstEmployee, indexOfLastEmployee);
    const filterbydate = async () => {
        console.log('test')
        let date = document.getElementById('date').value
        let who = document.getElementById('who').value
        console.log(who)
        const url = new URL(import.meta.env.VITE_API + `/getAllhistoryONOFF`);
        url.searchParams.append('date', date);
        url.searchParams.append('who', who);
        const res = await axios.get(url.toString());
        console.log(res.data)
        setDataa(res.data)
    }
    return (
        <>
            <NavBar />
            <Container>
                <div >
                    <input style={{margin:'1rem'}} type='date' id='date' onChange={filterbydate} />
                    <select style={{margin:'1rem'}} onChange={filterbydate} name='known' id='who'>
                        <option value="known">Known</option>
                        <option value="unknown">Unknown</option>
                    </select>
                </div>
                <Table hover>
                    <thead>
                        <tr>
                            <th ></th>
                            <th>Name</th>
                            <th>Expression</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Single Detect</th>
                            <th>Envoriment</th>
                        </tr>
                    </thead>
                    {currentEmployees.length > 0 ? (
                        <tbody>
                            {currentEmployees.map((data, key) => (
                                <tr key={key}>
                                    <td>{indexOfFirstEmployee + key + 1}</td>
                                    <td>{data.name}</td>
                                    <td>{data.expression}</td>
                                    <td>{data.date}</td>
                                    <td>{data.time}</td>
                                    <td><img style={{ borderRadius: '0.5rem' }} src={getImagePath(data.name, data.path)} alt="" /></td>
                                    <td><img style={{ borderRadius: '0.5rem' }} src={getImagePathEnv(data.env_path)} alt="" /></td>
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
                        {[...Array(Math.ceil(dataa.length / employeesPerPage)).keys()].map(number => (
                            <Pagination.Item key={number + 1} active={number + 1 === currentPage} onClick={() => paginate(number + 1)}>
                                {number + 1}
                            </Pagination.Item>
                        ))}
                    </Pagination>
                </div>
            </Container>
        </>
    )
}
