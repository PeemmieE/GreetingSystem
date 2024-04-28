import React, { useState, useEffect } from 'react'
import NavBar from './nav/NavBar'
import { Container, Pagination, Button, Table } from 'react-bootstrap'
import AlbumCSS from './style/Album.module.css'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLockOpen, faMagnifyingGlass, faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'

function Album() {
    const [employeeoff, setEmployeeoff] = useState([]);
    const [employee, setEmployee] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageOff, setCurrentPageOff] = useState(1);
    const [employeesPerPage] = useState(5);
    const indexOfLastEmployee = currentPage * employeesPerPage;
    const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
    const currentEmployees = employee.slice(indexOfFirstEmployee, indexOfLastEmployee);

    const indexOfLastEmployeeOff = currentPageOff * employeesPerPage;
    const indexOfFirstEmployeeOff = indexOfLastEmployeeOff - employeesPerPage;
    const currentEmployeesOff = employeeoff.slice(indexOfFirstEmployeeOff, indexOfLastEmployee);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const paginateOff = (pageNumber) => setCurrentPageOff(pageNumber);

    useEffect(() => {
        const getEmployee = async () => {
            try {
                const res = await axios.get(import.meta.env.VITE_API + '/getEmployee');
                setEmployee(res.data);
                // console.log(res.data);
            }
            catch (err) {
                console.log(err);
            }

        }
        const getEmployeeOff = async () => {
            try {
                const res = await axios.get(import.meta.env.VITE_API + '/getEmployeeOff');
                setEmployeeoff(res.data);
                // console.log(res.data);
            }
            catch (err) {
                console.log(err);
            }
        }
        getEmployee();
        getEmployeeOff();
    }, [])
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
    const searchOffData = async () => {
        let nameOn = document.getElementById('off').value

        try {
            const url = new URL(import.meta.env.VITE_API + '/getEmployeeOff');
            url.searchParams.append('name', nameOn);
            const res = await axios.get(url.toString());
            setEmployeeoff(res.data);
            // console.log(res.data);
        }
        catch (err) {
            console.log(err);
        }
    }

    const changeStatus = async (employee) => {
        if (window.confirm('Are you sure you want to change the status back to ON?')) {

            //transfer img folder path
            try {
                const res = await axios.post(import.meta.env.VITE_API + '/changeStatus', {
                    folderName: employee.employee_name,
                    status: 'ON',
                });
                console.log(res.data);
            } catch (error) {
                console.error('Error changing status:', error);
            }

            //update status on db
            try {
                const response = await axios.post(import.meta.env.VITE_API + '/updateStatusDB', { folderName: employee.employee_name, status: 'ON' });
                console.log(response.data);
                // navigate('/album')
                window.location.href = `/album`;
            } catch (error) {
                console.error('Error renaming folder:', error);
            }

            //kiosk api change statusOff
            try {
                const response = await axios.post(import.meta.env.VITE_KIOSK_API + '/labelsOn', { labelName: employee.employee_name });
                console.log(response.data);
            } catch (error) {
                console.error('Error renaming folder:', error);
            }
        }
    };

    const DeleteEmp = async (emp) => {

        alert('ลบข้อมูลสำเร็จ');

        const employee = emp;

        //1 for db
        try {
            const response = await axios.post(import.meta.env.VITE_API + '/deleteDB', { folderName: employee });
            console.log(response.data);
        } catch (error) {
            console.log(error);
        }

        searchOffData();

        //2 for web
        try {
            const res = await axios.post(import.meta.env.VITE_API + '/deletefolder', {
                folderName: employee,
            });
            console.log(res.data);
        } catch (error) {
            console.error('Error changing status:', error);
        }

        //3 for kiosk
        try {
            const res = await axios.post(import.meta.env.VITE_KIOSK_API + '/deleteLabelFolder', {
                folderName: employee,
            });
            console.log(res.data);
        } catch (error) {
            console.error('Error changing status:', error);
        }
    };

    return (
        <div>
            <NavBar />
            <Container>
                <div className={AlbumCSS.newCollectionBtn} >
                    <Button href="/newCollection" variant='primary' >New Collection <FontAwesomeIcon icon={faPlus} /></Button>
                </div>
                <div className={AlbumCSS.bigcontainer}>
                    {employee ? (
                        <div className={AlbumCSS.tb1container}>
                            <div className='inin'>
                                <input id='on' placeholder='Search' style={{ width: '80%', padding: '0.25rem' }} type='text' />
                                <Button style={{ width: '14%', margin: '1rem' }} ><FontAwesomeIcon onClick={searchOnData} icon={faMagnifyingGlass} /> </Button>
                            </div>
                            <Table hover>
                                <thead>
                                    <tr >
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
                                                <Button href={`/tt/${data.employee_name}`} variant='success' style={{ width: '80%' }}>
                                                    <FontAwesomeIcon icon={faPen} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            <div className={AlbumCSS.paginationcontainer}>
                                <Pagination>
                                    {[...Array(Math.ceil(employee.length / employeesPerPage)).keys()].map(number => (
                                        <Pagination.Item key={number + 1} active={number + 1 === currentPage} onClick={() => paginate(number + 1)}>
                                            {number + 1}
                                        </Pagination.Item>
                                    ))}
                                </Pagination>
                            </div>
                        </div>
                    ) : ''}
                    {employeeoff ? (
                        <div className={AlbumCSS.tb1container}>
                            <div>
                                <input id='off' placeholder='Search' style={{ width: '80%', padding: '0.25rem' }} type='text' />
                                <Button style={{ width: '14%', margin: '1rem' }} ><FontAwesomeIcon onClick={searchOffData} icon={faMagnifyingGlass} /> </Button>
                            </div>
                            <Table hover>
                                <thead>
                                    <tr>
                                        <th ></th>
                                        <th>Name</th>
                                        <th colSpan={2}>Actions</th>
                                    </tr>
                                </thead>
                               
                                    {currentEmployeesOff.length > 0 ? (
                                         <tbody>{currentEmployeesOff.map((data, key) => (
                                            <tr key={key}>
                                                <td>{indexOfFirstEmployeeOff + key + 1}</td>
                                                <td>{data.employee_name}</td>
                                                <td>
                                                    <Button onClick={() => changeStatus(data, data.employee_name)} style={{ backgroundColor: 'green', width: '80%' }}>
                                                        <FontAwesomeIcon icon={faLockOpen} />
                                                    </Button>
                                                </td>
    
                                                <td style={{ textAlign: 'center' }}>
    
                                                    <Button onClick={() => DeleteEmp(data.employee_name)} variant='success' style={{ backgroundColor: 'red', width: '80%' }}>
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </Button>
                                                </td>
                                            </tr>
                                            
                                        ))}</tbody>
                                    ):(
                                        <tbody>
                                            <tr>
                                                <td colSpan='3'>No Employee Status Off</td>
                                            </tr>
                                        </tbody>
                                    )}
                                    
                              
                            </Table>
                            <div className={AlbumCSS.paginationcontainer}>
                                <Pagination>
                                    {[...Array(Math.ceil(employeeoff.length / employeesPerPage)).keys()].map(number => (
                                        <Pagination.Item key={number + 1} active={number + 1 === currentPageOff} onClick={() => paginateOff(number + 1)}>
                                            {number + 1}
                                        </Pagination.Item>
                                    ))}
                                </Pagination>
                            </div>



                        </div>
                    ) : (<h1>No status off</h1>)}


                </div>
            </Container>
        </div>

    )
}

export default Album