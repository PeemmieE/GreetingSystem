import React, { useState, useEffect, useRef } from 'react'
import NavBar from './nav/NavBar'
import { Button, Container, Pagination, Table } from 'react-bootstrap'
import Form from 'react-bootstrap/Form';
import axios from 'axios';
import HomeStyle from './style/HomeStyle.module.css';
import { Pie, Line, Bar } from 'react-chartjs-2';
import { Chart, ArcElement } from 'chart.js'

import { useParams, useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register the chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Search() {
  const [employee, setEmployee] = useState([]);
  const chartRef = useRef(null);
  const [his, setHis] = useState([])
  const scrollRef = useRef(null);
  const [dummy, setDummy] = useState([])
  const [chartData, setChartData] = useState({
    datasets: [],
  });
  const [chartDataline, setChartDataline] = useState({
    datasets: [],
  });
  useEffect(() => {
    const getEmployee = async () => {
      try {
        const res = await axios.get(import.meta.env.VITE_API + '/getFaceDetectedHome');
        const sortedData = res.data.sort((a, b) => b.id - a.id);
        setEmployee(sortedData);
        setDummy(sortedData)
        console.log(sortedData);
        // console.log(res.data);
      }
      catch (err) {
        console.log(err);
      }
    }
    getEmployee();
  }, [])



  useEffect(() => {
    // console.log(employee)
    const sortedDetects = employee.sort((a, b) => new Date(a.date) - new Date(b.date));
    // console.log(employee)
    const expressionCounts = employee.reduce((acc, { expression }) => {
      acc[expression] = (acc[expression] || 0) + 1;
      return acc;
    }, {});

    const data = {
      labels: Object.keys(expressionCounts),
      datasets: [
        {
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
    sortedDetects.sort((a, b) => new Date(`1970/01/01 ${a.time}`) - new Date(`1970/01/01 ${b.time}`));

    const timelineData = {
      labels: sortedDetects.map(det => `${det.time}`), // Combine date and time for x-axis
      datasets: [{
        label: 'Expressions over time',
        data: sortedDetects.map(det => ({
          x: `${det.time}`,
          y: det.expression,
        })),
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 2,
      }],
    };

    setChartDataline(timelineData);
    setChartData(data);
    let sortedData = dummy.sort((a, b) => b.id - a.id);
    setEmployee(sortedData);
    setDummy(sortedData)
  }, [employee]);


  const chartOptionsline = {
    scales: {
      x: {
        // type: 'time',
        time: {
          parser: 'DD/MM/YYYY HH:mm:ss',
          tooltipFormat: 'DD/MM/YYYY HH:mm:ss',
          unit: 'minute',
          displayFormats: {
            minute: 'HH:mm:ss'
          }
        },
      },
      y: {
        type: 'category',
        labels: ['surprised', 'happy', 'neutral', 'sad', 'angry', 'fearful', 'disgusted']
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.raw.emotion}: ${context.parsed.x}`;
          }
        }
      }
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(5);
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = dummy.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const getImagePath = (single_img) => {
    return import.meta.env.VITE_API + `/labeled_images/${single_img}`;
  };
  const getImagePathEnv = (single_img) => {
    return import.meta.env.VITE_API + `/getENV/${single_img}`;
  };
  const paginate = (pageNumber) => setCurrentPage(pageNumber);


  return (
    <>
      <NavBar />
      <Container>
        <div className={HomeStyle.ac}>
          <div className={HomeStyle.iac}>
            <div className={HomeStyle.tbp}>
              <Table hover>
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
                    {currentEmployees.map((data, key) => (
                      <tr key={key}>
                        <td>{key + 1}</td>
                        <td>{data.name}</td>
                        <td>{data.expression}</td>
                        <td>{data.date}</td>
                        <td>{data.time}</td>
                        <td><img style={{ borderRadius: '0.5rem' }} src={getImagePath(data.path)} alt="" /></td>
                        <td><img style={{ borderRadius: '0.5rem' }} src={getImagePathEnv(data.env_path)} alt="" /></td>
                      </tr>
                    ))}</tbody>
                ) : (
                  <tbody>
                    <td colSpan='7'>ไม่มีการ Detect หน้าในวันนี้</td>
                  </tbody>
                )}


              </Table>
              <Pagination>
                {[...Array(Math.ceil(dummy.length / employeesPerPage)).keys()].map(number => (
                  <Pagination.Item key={number + 1} active={number + 1 === currentPage} onClick={() => paginate(number + 1)}>
                    {number + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            </div>
            <div className={HomeStyle.fchart}>
              {chartData.datasets.length > 0 && (
                <Pie data={chartData} />
              )}
            </div>
          </div>
          {currentEmployees.length > 0 ? (
          <div className={HomeStyle.sChart}>
            <h3>Expression Breakdown</h3>
            {chartDataline.datasets.length > 0 && (
              <Line ref={chartRef} options={chartOptionsline} data={chartDataline} />
            )}
          </div>):(
            ''
          )}
        </div>
      </Container>
    </>
  );
}
export default Search
