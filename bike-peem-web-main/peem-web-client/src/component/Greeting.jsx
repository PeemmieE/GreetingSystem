import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, Button, InputGroup, FormControl, ListGroup } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavBar from './nav/NavBar';

function Greeting() {
  const [expressions, setExpressions] = useState([]);
  const [selectedExpression, setSelectedExpression] = useState('neutral');
  const [greetingMessage, setGreetingMessage] = useState('');
  const [greetings, setGreetings] = useState([]);

  useEffect(() => {
    const fetchExpressions = async () => {
      try {
        const { data } = await axios.get(import.meta.env.VITE_API + '/getExpression');
        setExpressions(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch expressions.");
      }
    };
    fetchExpressions();
  }, []);

  const handleSubmitGreeting = async (e) => {
    e.preventDefault();
    if (!greetingMessage.trim()) {
      toast.warn('Please enter a valid greeting message.');
      return;
    }
    try {
      await axios.post(import.meta.env.VITE_API + '/addGreeting', { emotion: selectedExpression, greeting: greetingMessage });
      setGreetingMessage('');
      fetchGreetings();
      toast.success('Greeting added successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add greeting.');
    }
  };

  const fetchGreetings = async () => {
    try {
      const { data } = await axios.post(import.meta.env.VITE_API + '/getGreeting', { emotion: selectedExpression });
      setGreetings(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch greetings.");
    }
  };

  const deleteGreeting = async (emotion, greeting) => {
    try {
      await axios.delete(import.meta.env.VITE_API + '/deleteGreeting', { data: { emotion, greeting } });
      fetchGreetings();
      toast.info('Greeting deleted.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete greeting.');
    }
  };

  useEffect(() => {
    if (selectedExpression) fetchGreetings();
  }, [selectedExpression]);

  return (
    <>
    <NavBar/>
    <Container className="py-5">
      <ToastContainer />
      <Form onSubmit={handleSubmitGreeting}>
        <InputGroup className="mb-3">
          <Form.Select value={selectedExpression} onChange={e => setSelectedExpression(e.target.value)}>
            {expressions.map((exp, idx) => (
              <option key={idx} value={exp.emotion}>{exp.emotion}</option>
            ))}
          </Form.Select>
          <FormControl
            placeholder="Enter a greeting message"
            value={greetingMessage}
            onChange={e => setGreetingMessage(e.target.value)}
          />
          <Button variant="primary" type="submit">Add Greeting</Button>
        </InputGroup>
      </Form>

      <ListGroup>
        {greetings.map((greet, idx) => (
          <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center">
            {greet.greeting}
            <Button variant="outline-danger" size="sm" onClick={() => deleteGreeting(greet.emotion, greet.greeting)}>Delete</Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
    </>
  );
}

export default Greeting;