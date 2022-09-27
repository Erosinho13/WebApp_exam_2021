import 'bootstrap/dist/css/bootstrap.min.css';
import '../../custom.css';

import {useState, useEffect} from 'react';
import {Form, Row, Col, Button, ListGroup, Navbar, Alert, Spinner} from 'react-bootstrap';
import {useHistory} from 'react-router-dom';

import AddQuestion from './AddQuestion';
import {Headline} from '../../utils';
import {Plus, Up, Down, Bin} from '../../svgs';

import API from '../../API.js';

function AddedQuestion(props) {

  const variants = ['light-odd', 'light-right'];

  const moveUp = () => {
    let copy = props.questions;
    const id = props.question_id-1;
    [copy[id], copy[id-1]] = [copy[id-1], copy[id]]
    props.setQuestions([...copy]);
  };

  const moveDown = () => {
    let copy = [...props.questions];
    const id = props.question_id-1;
    [copy[id], copy[id+1]] = [copy[id+1], copy[id]]
    props.setQuestions(copy);
  };

  const deleteQ = () => {
    let copy = [...props.questions];
    copy.splice(props.question_id-1, 1);
    props.setLastQId(id => id-1);
    props.setQuestions(copy);
  };

  return (

    <ListGroup.Item variant={variants[props.question_id%2]}>

      <Form.Group>
        
        <Navbar variant={variants[props.question_id%2]}>
          <Navbar.Brand className='responsive-text'>
            {props.question_id}) {props.question_title}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls='basic-navbar-nav'/>
          <Navbar.Collapse id='basic-navbar-nav' className='justify-content-end'>
            <Button onClick={moveUp}
              className={`edit ${props.question_id === 1 ? 'none' : ''}`}>
              <Up size='16' />
            </Button>
            <Button onClick={moveDown}
              className={`edit 
                ${(props.questions.length === 1 || props.questions.length === props.question_id) ?
                  'none' :
                  ''}`}>
              <Down size='16' />
            </Button>
            <Button className='edit' onClick={deleteQ}>
              <Bin size='16' />
            </Button>
          </Navbar.Collapse>
        </Navbar>
      </Form.Group>

    </ListGroup.Item>

  );
  
}

function TitleField(props) {

  return (
    <>
      
      <Form.Group as={Row}>
        <Form.Label column sm={2}>
          Survey title:
        </Form.Label>
        <Col sm={8}>
          <Form.Control type='text' placeholder='name'
            onChange={ev => props.setSurveyTitle(ev.target.value)}
            className={props.isValid ? '' : 'form-control-error'}/>
        </Col>
        <Col sm={2}>
          <Button variant='mandarin' className='plus' onClick={props.handleShow}>
            <Plus size='16' />
          </Button>
        </Col>
      </Form.Group>

      <AddQuestion show={props.show} handleClose={props.handleClose} qtype={props.qtype}
        setQtype={props.setQtype} options={props.options} setOptions={props.setOptions}
        mandatory={props.mandatory} setMandatory={props.setMandatory} min={props.min}
        setMin={props.setMin} max={props.max} setMax={props.setMax} 
        handleSubmit={props.handleSubmit} questions={props.questions}
        setQuestions={props.setQuestions} lastQId={props.lastQId} notValid={props.notValid}/>

    </>
  );

}

function NewSurvey(props) {

  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [lastQId, setLastQId] = useState(0);
  const [isValid, setIsValid] = useState(true);
  const [surveyTitle, setSurveyTitle] = useState('');
  const [notValid, setNotValid] = useState([]);
  const [show, setShow] = useState(false);
  const [qtype, setQtype] = useState('');
  const [options, setOptions] = useState([]);

  const [mandatory, setMandatory] = useState('');
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(1);

  let history = useHistory();

  const setNewSurvey = props.setNewSurvey;

  useEffect(() => {
    setNewSurvey(true);
  }, [setNewSurvey]);

  const handleShow = () => {

    let copy = [...questions];

    if (!copy[lastQId])
      copy.push({});

    setQuestions(copy);

    setShow(true);
    
  };

  const handleClose = (closed=true) => {

    if (closed) {
      let copy = [...questions];
      copy.splice(-1, 1);
      setQuestions(copy);
    }
      
    setNotValid([]);
    setQtype('');
    setOptions([]);
    setMandatory('');
    setMin(0);
    setMax(1);
    setShow(false);

  };

  const handleSubmit = (event) => {

    event.preventDefault();

    let not_valid = [];
    let q = questions[questions.length-1];
    
    if (!q.title)
      not_valid = ['title'];
    else if (q.title.length < 3)
      not_valid = ['title'];

    if (!qtype)
      not_valid.push('qtype');
    else if (qtype === 'closed')
      q.is_closed = 1;
    else
      q.is_closed = 0;
    
    if (qtype === 'open') {

      if (!mandatory)
        not_valid.push('mandatory');
      else if (mandatory === 'yes')
        q.min = q.max = 1;
      else
        q.min = q.max = 0;

    }
    else {
      
      q.min = min;
      q.max = max;

      for (let i=0; i<options.length; i++)
        if (options[i] === '')
          not_valid.push(i+1)
      
      q.options = options;
      q.num_options = options.length;

    }

    setNotValid(not_valid);

    if (not_valid.length === 0) {
      let copy = [...questions];
      copy[questions.length-1] = q;
      setQuestions(copy);
      setLastQId(qid => qid+1);
      handleClose(false);
    }

  }

  const handleRedirect = () => {
    props.setMessage({msg: 'Survey successfully added!', type: 'success'});
    setLoading(false);
    history.push('/');
  }

  const handleFinalSubmit = (event) => {

    event.preventDefault();

    setIsValid(!(surveyTitle === ''));
    
    if (surveyTitle !== '') {
      
      setLoading(true);

      let objToPost = {
        'title': surveyTitle,
        'questions': questions
      };

      API.submitNewSurvey(objToPost);

      API.getNumResponses().then((res) => {
        props.setNumResponses(res);
        handleRedirect();
      });
      
    }

  };

  return (
    <>
    {loading ? 

      <Spinner animation='border' /> :

      <>

        <Headline title='Add a new survey'
          subtitle='Fill the form below and create your new survey!'/>
        
        {!isValid && 
          <Alert variant='danger' className='error-alert'>
            Please insert the name of the survey
          </Alert>}

        <Form>
        
          <TitleField questions={questions} setQuestions={setQuestions}
            lastQId={lastQId} setLastQId={setLastQId} notValid={notValid}
            setNotValid={setNotValid} show={show} qtype={qtype} setQtype={setQtype}
            options={options} setOptions={setOptions} mandatory={mandatory}
            setMandatory={setMandatory} min={min} setMin={setMin} max={max} setMax={setMax}
            handleShow={handleShow} handleClose={handleClose} handleSubmit={handleSubmit}
            isValid={isValid} setSurveyTitle={setSurveyTitle}/>
          
          <ListGroup>
            {questions.map((question, index) => {
              return (
                <AddedQuestion key={index+1} question_id={index+1}
                  question_title={question.title} questions={questions}
                  setQuestions={setQuestions} setLastQId={setLastQId}/>
              );
            })}
          </ListGroup>

          <Button variant='mandarin-margin'
            className={questions.length === 0 ? 'none' : ''}
            onClick={handleFinalSubmit}>Add the survey</Button>

        </Form>

      </>
    }
    </>
  );
  
}

export default NewSurvey;