import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css';

import {ListGroup, Spinner, Alert} from 'react-bootstrap';
import {useEffect} from 'react';

import {Headline, SurveyRow} from './utils';
import API from './API.js';

function ActiveSurveys(props) {
  
  const setAnswering = props.setAnswering;
  const setLoggingIn = props.setLoggingIn;
  const setLoading = props.setLoading;
  const setSurveys = props.setSurveys;

  useEffect(() => {
    setAnswering(false);
    setLoggingIn(false);
  }, [setAnswering, setLoggingIn]);
  
  useEffect(() => {
    setLoading(true);
    API.getSurveys().then((res) => {
      setSurveys(res);
      setLoading(false);
    });
  }, [setLoading, setSurveys]);

  return (
    <>
      <Headline title='Active surveys'
        subtitle='Pick one of the following surveys and start answering!'/>
      {props.loading ? 
        <Spinner animation='border' /> :
        <ListGroup>
          {!props.surveys.error ? 
            props.surveys.map((survey) => {
              return (
                <SurveyRow key={survey.id} id={survey.id} title={survey.title}
                text={`Author: ${survey.admin}`} linkTo={`/survey/${survey.id}`}/>);
            }) :
            <Alert variant='danger' className='error-alert'>
              No published surveys yet!
            </Alert>
        }
        </ListGroup>
      }
    </>
  )

}
export default ActiveSurveys;