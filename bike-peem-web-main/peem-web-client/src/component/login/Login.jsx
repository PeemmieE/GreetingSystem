import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import { useUserAuth } from '../../context/UserAuthContext';
import styles from '../style/Login.module.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { login } = useUserAuth();

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/home');
    }
    catch (err) {
      console.log('Error is: ' + err);
    }
  };

  return (
    <>
      <Container className={styles.loginContainer}>
        <h1 className={styles.title}>Login</h1>
        <form onSubmit={handleLogin}>
          <label className={styles.label}>
            Username:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
            />
          </label>
          <br />
          <label className={styles.label}>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
            />
          </label>
          <br />
          <button type="submit" className={styles.submitButton}>Login</button>
        </form>
        <a href='/reg'>Register</a>
      </Container>
    </>
  );
}
export default Login;