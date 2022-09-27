import 'bootstrap/dist/css/bootstrap.min.css';
import '../../custom.css';

import {Form, ListGroup, Navbar} from 'react-bootstrap';

function getClassName(notValid, id) {

  if (notValid.includes(`question_${id}`))
    return 'list-group-error'

  if (notValid.includes(`question_${id+1}`))
    return 'list-group-following-error'

  return ''

}

function QuestionHeader(props) {

  const variants = ['oddrows_h', 'rightrows_h'];
  const isMandatory = !props.is_closed && props.min === 1 && props.max === 1;
  const isNotMandatory = !props.is_closed && props.min === 0 && props.max === 0;

  return (

    <Navbar variant={variants[props.id%2]}>
      <Navbar.Brand className='responsive-text'>{props.id}) {props.title}</Navbar.Brand>
      <Navbar.Collapse className='justify-content-end'>
        {props.is_closed ?
          <Navbar.Text>
            Minimum answers: {props.min} <br/>
            Maximum answers: {props.max}
          </Navbar.Text> :
          <></>}
        {!props.is_closed && isNotMandatory ?
          <Navbar.Text>Optional</Navbar.Text> :
          <></>}
        {!props.is_closed && isMandatory ?
          <Navbar.Text>Mandatory</Navbar.Text> :
          <></>}
      </Navbar.Collapse>
    </Navbar>

  );

}

function ClosedQuestionField(props) {

  return (
    props.question.options.map((option) => {
      return (
        <ClosedQuestionOption key={option.id}
          question_id={props.question.id}
          option_id={option.id} option={option.option}
          closedAnswers={props.closedAnswers}
          setClosedAnswers={props.setClosedAnswers}/>
      );
    })
  );

}

function ClosedQuestionOption(props) {

  const variants = ['oddrows_h', 'rightrows_h'];

  return (
    <Form.Check type='checkbox' label={props.option}
      className={`form-check-${variants[props.question_id%2]}`}
      onChange={
        ev => {
          if (ev.target.checked) {
            const answer = {
              question_id: props.question_id,
              option_id: props.option_id
            };
            props.setClosedAnswers([...props.closedAnswers, answer]);
          }
          else {
            let copy = [...props.closedAnswers];
            for (let i=0; i<props.closedAnswers.length; i++) {
              if (props.closedAnswers[i].question_id === props.question_id && 
                props.closedAnswers[i].option_id === props.option_id) {
                copy.splice(i, 1);
                props.setClosedAnswers(copy);
                break;
              }
            }
          }
        }
      }/>

  );

}

function OpenQuestionField(props) {

  return (
    <Form.Control as='textarea' rows={3} maxLength='200'
      onChange={
        ev => {props.setOpenAnswers({...props.openAnswers, [props.id]:ev.target.value});}
      }
    />
  );

}

function Question(props) {

  const variants = ['oddrows_h', 'rightrows_h'];

  let class_name = '';
  if (!props.read_only)
    class_name = getClassName(props.notValid, props.question.id);

  return (

    <ListGroup.Item variant={variants[props.question.id%2]}
      className={class_name}>

      <Form.Group>
        
        <QuestionHeader id={props.question.id} title={props.question.title} 
          is_closed={props.question.is_closed} min={props.question.min}
          max={props.question.max}/>

        <hr />

        {!props.read_only && props.question.is_closed ?
          <ClosedQuestionField question={props.question} closedAnswers={props.closedAnswers}
            setClosedAnswers={props.setClosedAnswers}/> :
          <></>
        }
        {!props.read_only && !props.question.is_closed ?
          <OpenQuestionField openAnswers={props.openAnswers}
            setOpenAnswers={props.setOpenAnswers} id={props.question.id}/> :
          <></>
        }
        {
          props.read_only ?
            <> {props.content} </>
          :
            <></>
        }

      </Form.Group>

    </ListGroup.Item>

  );
  
}

export {Question};