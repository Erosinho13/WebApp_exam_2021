import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../custom.css';

import {useState, useEffect} from 'react';
import {Navbar, Spinner, Button, ListGroup, Form} from 'react-bootstrap';
import {Link} from 'react-router-dom';

import {Question} from '../../../survey/id/Question';
import {Left, Right} from '../../../svgs';

import API from '../../../API';

function SurveyResponses(props) {

  const [answers, setAnswers] = useState([]);
  const [ansIds, setAnsIds] = useState([]);
  const [currentAId, setCurrentAId] = useState(-1);
  const [surveyTitle, setSurveyTitle] = useState('');
  const [questions, setQuestions] = useState([])

  const setSurveyStatsFlag = props.setSurveyStatsFlag;
  const survey_id = props.survey_id;

  useEffect(() => {
    setSurveyStatsFlag(true);
  }, [setSurveyStatsFlag]);

  useEffect(
    () => API.getSurveyById(survey_id).then(ans => setSurveyTitle(ans.title)),
    [survey_id]
  );

  useEffect(() => {
    API.getSurveyAnswers(survey_id).then((ans) => {
      if (ans.info) {
        setAnswers([-1]);
        setAnsIds([-1]);
        setCurrentAId(-2);
      }
      else {
        delete ans.admin_id;
        setAnswers([ans]);
        setAnsIds(Object.keys(ans));
        setCurrentAId(0);
      }
    });
    API.getQuestions(survey_id).then(res => setQuestions(res));
  }, [survey_id]);

  const leftUser = (event) => {
    event.preventDefault();
    setCurrentAId(cid => cid-1);
  }

  const rightUser = (event) => {
    event.preventDefault();
    setCurrentAId(cid => cid+1);
  }

  return (
    <>
    {(questions.length === 0 || answers.length === 0 || ansIds.length === 0 ||
      currentAId === -1 || !surveyTitle) ? 
      <Spinner animation='border' /> :
      <></>
    }
    {(questions.length !== 0 && answers.length === 1 && ansIds.length === 1 &&
      currentAId === -2 && surveyTitle) ?
      <>
        <h2>{surveyTitle}</h2>
        <div id='no-answers'>Nobody answered this survey yet!</div>
        <Link to='/admin-panel' className='btn btn-info my-sm-0'>Back</Link>
      </> :
      <></>
    }
    {(questions.length !== 0 && answers.length !== 0 && ansIds.length !== 0 &&
      currentAId >= 0 && surveyTitle) ?
      <>

        <h2>{surveyTitle}</h2>

        <Navbar className='ml-auto flex-row' expand='' variant='light' bg='light'>
          <Button variant='info' onClick={leftUser}
          className={(ansIds.length > 1 && currentAId !== 0) ? '' : 'hidden'}>
            <Left size='31' />
          </Button>
          <h3>{answers[0][`${ansIds[currentAId]}`].user}</h3>
          <Button variant='info' onClick={rightUser}
          className={(ansIds.length > 1 && currentAId !== ansIds.length-1) ? '' : 'hidden'}>
            <Right size='31' />
          </Button>
        </Navbar>

        <ListGroup>

          {questions.map((question) => {
            const ans = answers[0][`${ansIds[currentAId]}`].answers[question.id];
            return (
              <Question key={question.id} question={question} read_only={true}
              content={
                <Form>
                {
                question.is_closed ?
                  question.options.map((option) => {
                    let checked = false;
                    if (ans)
                      if (ans.includes(option.id))
                        checked = true;
                    return (
                      <Form.Check key={option.id} type='checkbox' label={option.option}
                        checked={checked} readOnly/>
                    );
                  }) : (
                    !ans || Array.isArray(ans) ?
                      <Form.Control as='textarea' rows={3} maxLength='200' value='' disabled/> :
                      <Form.Control as='textarea' rows={3} maxLength='200' value={ans} disabled/>
                  )
                }
                </Form>
              }
              />
            );
          })}

        </ListGroup>
      </> :
      <></>
    }
    </>
  );

}

export default SurveyResponses;