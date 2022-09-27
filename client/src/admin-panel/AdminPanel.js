import 'bootstrap/dist/css/bootstrap.min.css';
import '../custom.css';

import {useEffect} from 'react';
import {ListGroup, Spinner, Alert} from 'react-bootstrap';
import {Headline, SurveyRow} from '../utils';

import API from '../API.js';

function AdminPanel(props) {

  const setNewSurvey = props.setNewSurvey;
  const setSurveyStatsFlag = props.setSurveyStatsFlag;
  const setLoading = props.setLoading;
  const setNumResponses = props.setNumResponses;
  
  useEffect(() => {
    setNewSurvey(false);
    setSurveyStatsFlag(false);
  }, [setNewSurvey, setSurveyStatsFlag]);

  useEffect(() => {
    setLoading(true);
    API.getNumResponses().then((res) => {
      setNumResponses(res);
      setLoading(false);
    });
  }, [setLoading, setNumResponses]);

  let id = 0;

  return (
    <>
    <Headline title='Your published surveys'
        subtitle='Pick one of the following surveys to get the responses!'/>
      {props.loading ? 
        <Spinner animation='border' /> :
        <ListGroup>
          {props.numResponses.length ?
            props.numResponses.map((num_responses) => {
              return (
                <SurveyRow key={num_responses.survey_id} id={++id}
                title={num_responses.title}
                linkTo={`/admin-panel/survey/${num_responses.survey_id}`}
                text={`${num_responses.num_responses} response(s)`}/>);
            }) :
            <Alert variant='danger' className='error-alert'>
              No published surveys yet!
            </Alert>
        }
        </ListGroup>
      }
    </>
  );
}

export default AdminPanel;