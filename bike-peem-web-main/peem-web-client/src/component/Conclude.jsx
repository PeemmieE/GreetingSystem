import React from 'react'
import { useState, useRef, useEffect } from "react";
import NavBar from "./nav/NavBar";
import { Button, Table, Container, Pagination } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
// import './style/conclude.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faMagnifyingGlass, faQuestion, faLock, faChartLine, faUser, faFaceSmile, faDownload } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import Modal from 'react-bootstrap/Modal';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useReactToPrint } from "react-to-print";
import ConCss from './style/conclude.module.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Conclude() {
    const handleClose = () => setShow(false);
    const [show, setShow] = useState(false);
    const [dateStart, setDateStart] = useState(null)
    const [dateStop, setDateStop] = useState(null)
    const [his, setHis] = useState([])
    const [tableex, setTableEx] = useState([])
    const testd = useRef();
    const [employeeoff, setEmployeeoff] = useState([]);
    const [chartData, setChartData] = useState({
        datasets: [],
    });
    const conponentPDF = useRef();
    const searchOnData = async () => {
        let nameOn = document.getElementById('on').value
        try {
            const url = new URL(import.meta.env.VITE_API + '/getEmployee');
            url.searchParams.append('name', nameOn);
            const res = await axios.get(url.toString());
            setEmployee(res.data);
            // console.log(res.data);
        }
        catch (err) {
            console.log(err);
        }
    }
    const handleShow = async (label) => {

        try {
            const startDate = document.getElementById('d1').value;
            const stopDate = document.getElementById('d2').value;
            const url = new URL(import.meta.env.VITE_API + '/getAllhistoryByDate');
            url.searchParams.append('dateStart', startDate);
            if (stopDate) {
                url.searchParams.append('dateStop', stopDate);
            }
            url.searchParams.append('emotion', label);
            const res = await axios.get(url.toString());
            // console.log(res.data)
            if (res.data) {
                // console.log(res.data)
                setTableEx(res.data);
            }
            else {
                setTableEx([]);
            }
        } catch (err) {
            console.log('Error fetching data:', err.message);
        }
        setShow(true)
    };
    const getImagePath = (single_img) => {
        return import.meta.env.VITE_API + `/labeled_images/${single_img}`;
    };
    const chartOptions = {
        onClick: (event, elements, chart) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const label = chart.data.labels[index];
                handleShow(label)
            }
        },
    };
    useEffect(() => {
        const expressionCounts = his.reduce((acc, { expression }) => {
            acc[expression] = (acc[expression] || 0) + 1;
            return acc;
        }, {});

        const data = {
            labels: Object.keys(expressionCounts),
            datasets: [
                {
                    label: 'Total Expressions',
                    data: Object.values(expressionCounts),
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#AEBE51',
                        '#0EFE51',
                        '#00FFFF',
                        // Add more colors as needed
                    ],
                },
            ],
        };

        setChartData(data);
    }, [his]);
    const [cunk, setCunk] = useState('0')
    useEffect(() => {
        const getAllhistory = async () => {
            try {
                const url = new URL(import.meta.env.VITE_API + '/getAllhistory');
                const res = await axios.get(url.toString());
                setHis(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        // for count Emp off
        const getEmployeeOff = async () => {
            try {
                const res = await axios.get(import.meta.env.VITE_API + '/getEmployeeOff');
                // console.log(res.data.length)
                setEmployeeoff(res.data.length);
            }
            catch (err) {
                console.log(err);
            }
        }
        //for count unknown
        const getUnknown = async () => {
            try {
                const res = await axios.get(import.meta.env.VITE_API + '/getUnknownDetect');
                setCunk(res.data.length);
                // console.log(res.data.length);
            }
            catch (err) {
                console.log(err);
            }
        }
        getAllhistory()
        getEmployeeOff()
        getUnknown()
    }, [])
    const [employee, setEmployee] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [employeesPerPage] = useState(5);
    const indexOfLastEmployee = currentPage * employeesPerPage;
    const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
    const currentEmployees = employee.slice(indexOfFirstEmployee, indexOfLastEmployee);

    const [currentPageEx, setCurrentPageEx] = useState(1);
    const indexOfLastEx = currentPageEx * employeesPerPage;
    const indexOfFirstEx = indexOfLastEx - employeesPerPage;
    const currentEx = tableex.slice(indexOfFirstEx, indexOfLastEx);

    // Change page
    const paginateEx = (pageNumber) => setCurrentPageEx(pageNumber);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    useState(() => {
        const getEmployee = async () => {
            try {
                const res = await axios.get(import.meta.env.VITE_API + '/getEmployee');
                setEmployee(res.data);
            }
            catch (err) {
                console.log(err);
            }
        }
        getEmployee();
    }, [])
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
            const url = new URL(import.meta.env.VITE_API + '/getAllhistoryByDate');
            url.searchParams.append('dateStart', startDate);
            if (stopDate) {
                url.searchParams.append('dateStop', stopDate);
            }
            const res = await axios.get(url.toString());
            if (res.data) {
                setHis(res.data, () => {
                    updateChartData(res.data);
                });
            } else {
                setHis([]);
            }
            const urln = new URL(import.meta.env.VITE_API + '/getUnknownDetect');
            urln.searchParams.append('dateStart', startDate);
            if (stopDate) {
                url.searchParams.append('dateStop', stopDate);
            }
            const ress = await axios.get(urln.toString());
            // console.log(ress.data)
            setCunk(ress.data.length)
        } catch (err) {
            console.log('Error fetching data:', err.message);
        }
    };

    const updateChartData = (historyData) => {
        const expressionCounts = historyData.reduce((acc, { expression }) => {
            acc[expression] = (acc[expression] || 0) + 1;
            return acc;
        }, {});

        const newData = {
            labels: Object.keys(expressionCounts),
            datasets: [
                {
                    label: 'Number of Expressions',
                    data: Object.values(expressionCounts),
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#AEBE51',
                        '#0EFE51',
                        '#00FFFF',
                        // Add more colors as needed
                    ],
                },
            ],
        };

        setChartData(newData);
    };
    const printDocument = () => {
        const input = document.getElementById('pdf')
        html2canvas(input) // Added options for better quality
            .then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });
                pdf.addImage(imgData, 'PNG', 0, 0);
                pdf.save("download.pdf");
            });
    };

    const generatePDF = useReactToPrint({
        // testd.current.classList.remove('chd');
        content: () => conponentPDF.current,
        documentTitle: "Userdata",
        onBeforeGetContent: () => {
            // Adjust the main component

            const anotherComponent1 = document.getElementById('chartUse');

            anotherComponent1.style.backgroundColor = '#EBD9B4';
            anotherComponent1.style.border = 'none';

            const anotherComponent2 = document.getElementById('btnnone1');
            const anotherComponent3 = document.getElementById('btnnone2');
            anotherComponent2.style.display = 'none'
            anotherComponent3.style.display = 'none'


            return Promise.resolve();
        },
        onAfterPrint: () => {

            const anotherComponent1 = document.getElementById('chartUse');

            anotherComponent1.style.backgroundColor = '#9DBC98';
            anotherComponent1.style.border = '1px black solid';

            const anotherComponent2 = document.getElementById('btnnone1');
            const anotherComponent3 = document.getElementById('btnnone2');
            anotherComponent2.style.display = 'inline'
            anotherComponent3.style.display = 'inline'
        }

    });

    return (
        <div className='allConclude' >
            <NavBar />

            <div >
                <div>
                    <div ref={conponentPDF} id='pdf'>
                        <div style={{ backgroundColor: '#EBD9B4', borderColor: 'black' }} className={`${ConCss.fconn} ${ConCss.allcon}`}>
                            <div style={{ width: '20%' }} className={"p-3 bg-white shadow-sm d-flex justify-content-around align-items-center rounded"}>
                                <div className="text-center mt-3">

                                    <h3 className="fs-2 ">
                                        {employee.length}
                                    </h3>
                                    <p className="fs-5">Employee </p>
                                </div>
                                <FontAwesomeIcon className='faUser' size='4x' icon={faUser} />
                            </div>
                            <div style={{ width: '20%' }} className=" p-3 bg-white shadow-sm d-flex justify-content-around align-items-center rounded">
                                <div className="text-center mt-3">

                                    <h3 className="fs-2 ">
                                        {his.length}
                                    </h3>
                                    <p className="fs-5">Detections </p>
                                </div>
                                <FontAwesomeIcon className='faUser' size='4x' icon={faFaceSmile} />
                            </div><div style={{ width: '20%' }} className=" p-3 bg-white shadow-sm d-flex justify-content-around align-items-center rounded">
                                <div className="text-center mt-3">

                                    <h3 className="fs-2 ">
                                        {employeeoff ? employeeoff : '0'}
                                    </h3>
                                    <p className="fs-5">Off Status </p>
                                </div>
                                <FontAwesomeIcon className='faUser' size='4x' icon={faLock} />
                            </div>
                            <div style={{ width: '20%' }} className=" p-3 bg-white shadow-sm d-flex justify-content-around align-items-center rounded">
                                <div className="text-center mt-3">

                                    <h3 className="fs-2 ">
                                        {cunk ? cunk : '0'}
                                    </h3>
                                    <p className="fs-5">Unknown Detect</p>
                                </div>
                                <FontAwesomeIcon className='faUser' size='4x' icon={faQuestion} />
                            </div>

                        </div>
                        <div style={{ backgroundColor: '#EBD9B4', borderColor: 'black' }} className={`${ConCss.sconn} ${ConCss.allcon}`}>
                            {employee ? (

                                <div style={{ backgroundColor: '#9DBC98', borderColor: 'black' }} className={`${ConCss.conTB}`} >
                                    <div>
                                        <div className={`${ConCss.inin}`}>
                                            <input id='on' placeholder='Search' style={{ width: '70%' }} type='text' />
                                            <Button style={{ width: '10%', margin: '1rem' }} onClick={searchOnData} ><FontAwesomeIcon icon={faMagnifyingGlass} /> </Button>
                                        </div>
                                        <Table style={{ borderColor: 'black' }} className={`${ConCss.tableef}`} hover>
                                            <thead>
                                                <tr>
                                                    <th ></th>
                                                    <th>Name</th>
                                                    <th >Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentEmployees.map((data, key) => (
                                                    <tr key={key}>
                                                        <td>{indexOfFirstEmployee + key + 1}</td>
                                                        <td>{data.employee_name}</td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <Button href={`/history/${data.employee_name}`} variant='success' style={{ width: '80%' }}>
                                                                <FontAwesomeIcon icon={faChartLine} />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                        <div className="pagination-container">
                                            <Pagination>
                                                {[...Array(Math.ceil(employee.length / employeesPerPage)).keys()].map(number => (
                                                    <Pagination.Item key={number + 1} active={number + 1 === currentPage} onClick={() => paginate(number + 1)}>
                                                        {number + 1}
                                                    </Pagination.Item>
                                                ))}
                                            </Pagination>
                                        </div>
                                    </div>

                                </div>


                            ) : ''}

                            <div id='chartUse' className={`${ConCss.chh}`}>
                                <div  >
                                    <label>Date Length:</label>
                                    <input id='d1' value={dateStart} onChange={(e) => setDateStart(e.target.value)} type='date' />
                                    <label> -</label>
                                    <input id='d2' value={dateStop} onChange={(e) => setDateStop(e.target.value)} type='date' />
                                    <Button id='btnnone2' onClick={filterbydate} style={{ width: '10%', marginLeft: '1rem' }}> <FontAwesomeIcon icon={faSearch} /></Button>
                                    <Button id='btnnone1' onClick={generatePDF} style={{ width: '20%', background: 'green', marginLeft: '1rem' }}>Export PDF <FontAwesomeIcon icon={faDownload} /></Button>
                                    {chartData.datasets.length > 0 && (
                                        <div className="print-chart-container">
                                            <Bar data={chartData}
                                                options={chartOptions}
                                            />
                                        </div>

                                    )}

                                </div>
                            </div>
                        </div>
                    </div>
                    <Modal className={`${ConCss.modalTest}`} show={show} onHide={handleClose}>
                        <Modal.Header className={`${ConCss.modalBody}`} closeButton>
                            <Modal.Title >{/*currentEx[0].expression ? currentEx[0].expression :''*/} Expression Table</Modal.Title>
                        </Modal.Header>
                        <Modal.Body >

                            <Table hover>
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>Name</th>
                                        {/* <th>Exression</th> */}
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Image</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {currentEx.map((data, key) => (

                                        <tr key={key}>
                                            <td>{key + 1}</td>
                                            <td>{data.name}</td>
                                            {/* <td>{data.expression}</td> */}
                                            <td>{data.date}</td>
                                            <td>{data.time}</td>
                                            <td><img style={{ borderRadius: '0.5rem' }} src={getImagePath(data.path)} alt="" /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            <div className="pagination-container">
                                <Pagination>
                                    {[...Array(Math.ceil(tableex.length / employeesPerPage)).keys()].map(number => (
                                        <Pagination.Item key={number + 1} active={number + 1 === currentPageEx} onClick={() => paginateEx(number + 1)}>
                                            {number + 1}
                                        </Pagination.Item>
                                    ))}
                                </Pagination>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        </div>
    )
}
