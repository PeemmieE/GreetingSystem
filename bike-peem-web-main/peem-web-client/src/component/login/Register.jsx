import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container } from 'react-bootstrap';
import styles from '../style/Login.module.css';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [oldname, setOldname] = useState([])
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordre, setPasswordre] = useState('');
    // const [status, setStatus] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isNameDuplicate = oldname.some(testItem => username === testItem.username);
        if (isNameDuplicate) {
            window.alert('Username is already taken.');
            return; // Stop execution if a duplicate name is found
        }
        if (password !== passwordre) {
            window.alert('Password ต้องซ้ำ');
            return;
        }

        try {
            const response = await axios.post(import.meta.env.VITE_API + '/register', {
                username,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('User registered:', response.data);
            alert('Register successfully');
            navigate('/')
        } catch (error) {
            console.error('Error during registration:', error);
        }
    };

    useEffect(() => {
        const fetchuser = async () => {
            try {
                const { data } = await axios.get(import.meta.env.VITE_API + '/getUser');
                console.log(data)
                setOldname(data);
            } catch (error) {
                console.error(error);
                toast.error("Failed to fetch expressions.");
            }
        };
        fetchuser();
    }, []);

    return (
        <>
            <Container className={styles.loginContainer}>
                <h1 className={styles.title}>Registration</h1>
                <form onSubmit={handleSubmit}>
                    <label className={styles.label}>
                        Username:
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </label>
                    <br />
                    <label className={styles.label}>
                        Password:
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </label>

                    <br />
                    <label className={styles.label}>
                        Re-Password:
                        <input type="password" value={passwordre} onChange={(e) => setPasswordre(e.target.value)} required />
                    </label>
                    <br />
                    <br />
                    <button type="submit">Register</button>
                </form>
            </Container>
        </>
    );
}

export default Register;
