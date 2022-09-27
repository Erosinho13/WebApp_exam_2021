import 'bootstrap/dist/css/bootstrap.min.css';
import '../custom.css';
import {Card, InputGroup, Form, FormControl, Button, Alert} from 'react-bootstrap';
import {useState, useEffect} from 'react';

function Login(props) {

  const setLogging = props.setLoggingIn;
  useEffect(() => setLogging(true), [setLogging]);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleSubmit = (event) => {

    event.preventDefault();
    setErrorMessage('');
    const credentials = {username, password};

    let valid = true;
    if (username === '' ||
      username.match(' ') ||
      password === '' ||
      password.length < 8 ||
      password.match(' ') ||
      !password.match(/\W/) ||
      !password.match(/\d/) ||
      !password.match(/\w/) ||
      password.match(/(.)\1\1/) || //3 chars in row
      username === password)
      valid = false;
    if (valid)
      props.login(credentials);
    else
      setErrorMessage('Error(s) in the form, please fix it.')

  };
  
  return (
    <>
    
      <Card bg={'light'} text={'dark'} className='mb-2'>
        <Card.Body>
          <Card.Title>Login form</Card.Title>
          <Card.Text>
            Please fill the form to start adding new surveys and reading statistics
          </Card.Text>
        </Card.Body>
      </Card>

      <Form>
        {errorMessage ?
          <Alert variant='danger' className='error-alert'> {errorMessage} </Alert> :
          ''}
        <Form.Group controlId='username'>
          <InputGroup className='mb-3'>
            <InputGroup.Prepend>
              <InputGroup.Text id='inputGroup-sizing-default'>Username</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl
              aria-label='Default'
              aria-describedby='inputGroup-sizing-default'
              type='text'
              value={username}
              maxLength='50'
              onChange={ev => setUsername(ev.target.value)}
            />
          </InputGroup>
        </Form.Group>
        <Form.Group controlId='password'>
          <InputGroup className='mb-3'>
            <InputGroup.Prepend>
              <InputGroup.Text id='inputGroup-sizing-default'>Password</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl
              aria-label='Default'
              aria-describedby='inputGroup-sizing-default'
              type='password'
              maxLength='50'
              value={password}
              onChange={ev => setPassword(ev.target.value)}
            />
          </InputGroup>
        </Form.Group>
        <Button variant='mandarin' onClick={handleSubmit}>Login</Button>
      </Form>

    </>
  );

}

export default Login;