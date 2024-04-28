import React, { useState, useEffect, useRef } from 'react'
import NavBar from './nav/NavBar'
import { Button, Container, Pagination, Table } from 'react-bootstrap'
import Form from 'react-bootstrap/Form';
import axios from 'axios';
import './style/home.css';
import { Pie, Line, Bar } from 'react-chartjs-2';
import { Chart, ArcElement } from 'chart.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faXmark, faMagnifyingGlass, faQuestion, faLock, faChartLine, faUser, faFaceSmile } from '@fortawesome/free-solid-svg-icons'
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
  const chartRef = useRef(null);
  const [his, setHis] = useState([])
  const scrollRef = useRef(null);
  const [detectt, setDetect] = useState([])
  const [chartData, setChartData] = useState({
    datasets: [],
  });
  const [chartDataline, setChartDataline] = useState({
    datasets: [],
  });



  // useEffect(() => {
  //   const sortedDetects = detectt.sort((a, b) => new Date(a.date) - new Date(b.date));

  //   const timelineData = {
  //     labels: sortedDetects.map(det => `${det.date} ${det.time}`), // Combine date and time for x-axis
  //     datasets: [{
  //       label: 'Expressions over time',
  //       data: sortedDetects.map(det => ({
  //         x: `${det.date} ${det.time}`,
  //         y: emotionToScale(det.expression), // Convert the emotion to a numerical value
  //       })),
  //       backgroundColor: 'rgba(75,192,192,0.4)',
  //       borderColor: 'rgba(75,192,192,1)',
  //       borderWidth: 2,
  //     }],
  //   };

  //   setChartData(timelineData);

  // }, [detectt]);


  useEffect(() => {
    const sortedDetects = detectt.sort((a, b) => new Date(a.date) - new Date(b.date));
    const expressionCounts = detectt.reduce((acc, { expression }) => {
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
    // const emotionToScale = (emotion) => {
    //   const scale = {
    //     'happy': 1,
    //     'sad': 2,
    //     'angry': 3,
    //     'fearful': 4,
    //     // Add more emotions as needed
    //   };
    //   return scale[emotion]; // If emotion not in scale, return 0 (or some default value)
    // };
    const reversedDetects = sortedDetects.slice().reverse();
    const timelineData = {
      labels: reversedDetects.map(det => `${det.date} ${det.time}`), // Combine date and time for x-axis
      datasets: [{
        label: 'Expressions over time',
        data: sortedDetects.map(det => ({
          x: `${det.date} ${det.time}`,
          y: det.expression,
        })),
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 2,
      }],
    };

    setChartDataline(timelineData);
    setChartData(data);
  }, [detectt]);


  const chartOptionsline = {
    scales: {
      x: {
        // type: 'time',
        time: {
          parser: 'DD/MM/YYYY HH:mm:ss', // กำหนดรูปแบบเวลาตามที่ข้อมูลของคุณเป็น
          tooltipFormat: 'DD/MM/YYYY HH:mm:ss',
          unit: 'minute',
          displayFormats: {
            minute: 'HH:mm:ss' // แสดงเฉพาะเวลาถ้าวันเดียวกัน
          }
        },
      },
      y: {
        type: 'category',
        labels: ['surprised','happy','neutral', 'sad', 'angry', 'fearful',  'disgusted'] // Define your emotion categories here
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            // Use the 'emotion' property to display the emotion name in the tooltip
            return `${context.raw.emotion}: ${context.parsed.x}`;
          }
        }
      }
    }
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(4);
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = detectt.slice(indexOfFirstEmployee, indexOfLastEmployee);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);


  const { name } = useParams();



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
    return import.meta.env.VITE_API + `/labeled_images/${single_img}`;
  };
  const getImagePathEnv = (single_img) => {
    return import.meta.env.VITE_API + `/getENV/${single_img}`;
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
        const url = new URL(import.meta.env.VITE_API + `/getEmpDetect/${name}`);
        url.searchParams.append('dateStart', startDate);
        if (stopDate) {
            url.searchParams.append('dateStop', stopDate);
        }
        const res = await axios.get(url.toString());
        setDetect(res.data)
        // if (res.data) {
        //     setHis(res.data, () => {
        //         updateChartData(res.data);
        //     });
        // } else {
        //     setHis([]);
        // }
    } catch (err) {
        console.log('Error fetching data:', err.message);
    }
};

  return (
    <>
      <NavBar />
      <Container>
        <div className='ac'>
          <div className='iac'>
            <div className='tbp'>
            <div>
                <input style={{ width: '30%' }} id='d1' type='date' />
                <label> -</label>
                <input style={{ width: '30%' }} id='d2' type='date' />
                <Button onClick={filterbydate} style={{ width: '10%', marginLeft: '1rem' }}> <FontAwesomeIcon icon={faSearch} /></Button>
                

              </div>
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
                {currentEmployees.length > 0 ?(
                    <tbody>
                    {currentEmployees.map((data, key) => (
  
                      <tr key={key}>
                        <td>{(currentPage*4-(4-key))+1}</td>
                        <td>{data.name}</td>
                        <td>{data.expression}</td>
                        <td>{data.date}</td>
                        <td>{data.time}</td>
                        <td><img style={{ borderRadius: '0.5rem' }} src={getImagePath(data.path)} alt="" /></td>
                        <td><img style={{ borderRadius: '0.5rem' }} src={getImagePathEnv(data.env_path)} alt="" /></td>
                      </tr>
                    ))}
                  </tbody>
                ):(
                  <tbody>
                    <td colSpan='7'>ไม่พบข้อมูล</td>
                  </tbody>
                )}
              
                

              </Table>
              <Pagination>
                  {[...Array(Math.ceil(detectt.length / employeesPerPage)).keys()].map(number => (
                    <Pagination.Item key={number + 1} active={number + 1 === currentPage} onClick={() => paginate(number + 1)}>
                      {number + 1}
                    </Pagination.Item>
                  ))}
                </Pagination>
            </div>
            <div className='fChart'>
              {/* <h3>Expression Breakdown</h3> */}
              {chartData.datasets.length > 0 && (
                <Pie data={chartData} />


              )}




            </div>

          </div>
          <div className='sChart'>
            <h3>Expression Breakdown</h3>
            {chartDataline.datasets.length > 0 && (
              <Line ref={chartRef} options={chartOptionsline} data={chartDataline} />


            )}
          </div>
        </div>
      </Container>
    </>
  );
}
export default Search
