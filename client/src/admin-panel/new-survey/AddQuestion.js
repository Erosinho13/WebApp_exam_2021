import 'bootstrap/dist/css/bootstrap.min.css';
import '../../custom.css';

import {Form, Button, Modal, InputGroup, FormControl,
  Dropdown, DropdownButton, Alert} from 'react-bootstrap';

import {Plus, Minus} from '../../svgs';

function Option(props) {

  const addOption = (event) => {
    event.preventDefault();
    const copy = [...props.options, ''];
    props.setOptions(copy);
  }

  const removeOption = (event) => {
    event.preventDefault();
    let copy = [...props.options];
    copy.splice(-1, 1);
    props.setOptions(copy);
  }

  let class_name_plus = '';
  let class_name_minus = '';
  
  if (props.option_id === props.options.length) {
    class_name_plus = ''
    props.option_id === 1 ? class_name_minus = 'none' : class_name_minus = '';
  }
  else {
    class_name_plus = 'none';
    class_name_minus = 'none';
  }
  
  return (
    <InputGroup className='mb-3'>
      <InputGroup.Prepend>
        <InputGroup.Text id='basic-addon1'>Option {props.option_id}</InputGroup.Text>
      </InputGroup.Prepend>
      <FormControl aria-describedby='basic-addon1'
        className={props.notValid.includes(props.option_id) ? 'form-control-error' : ''}
        onChange={ev => {
          let copy = [...props.options];
          copy[props.option_id-1] = ev.target.value;
          props.setOptions(copy);
        }}
      />
      <Button variant='mandarin' className={class_name_plus} onClick={addOption}>
        <Plus size='16' />
      </Button>
      
      <Button variant='danger' className={class_name_minus} onClick={removeOption}>
        <Minus size='16' />
      </Button>
    </InputGroup>
  );

}

function QuestionTitle(props) {
  
  return (
    <InputGroup className='mb-3'>
      <InputGroup.Prepend>
        <InputGroup.Text id='basic-addon1'>Question title</InputGroup.Text>
      </InputGroup.Prepend>
      <FormControl placeholder='title' aria-label='title'
        aria-describedby='basic-addon1' onChange={
          (event) => {
            let copy = [...props.questions];
            copy[props.question_id].title = event.target.value;
            props.setQuestions(copy);
          }
        }
        className={props.notValid.includes('title') ? 'form-control-error' : ''} />
    </InputGroup>
  );

}

function QuestionType(props) {

  return (

    <InputGroup className='mb-3'>
      <InputGroup.Prepend>
        <InputGroup.Text id='basic-addon1'>Question type</InputGroup.Text>
      </InputGroup.Prepend>
      <Form.Group
        className={`${props.notValid.includes('qtype') ? 'form-control-errorv2' : ''} q-type`}>
        <Form.Check inline label='closed-answer' type='radio' name='q-type'
          className='q-type-form-check' onChange={
            ev => {
              if (ev.target.checked) {
                props.setQtype('closed');
                props.setOptions(['']);
              }
            }
          }/>
        <Form.Check inline label='open-ended' type='radio' name='q-type'
          className='q-type-form-check' onChange={
            ev => {
              if (ev.target.checked) {
                props.setQtype('open');
                props.setOptions([]);
              }
            }
          }/>
      </Form.Group>
    </InputGroup>

  );

}

function AnswersConstraints(props) {

  return (
    
    <InputGroup className='mb-3'>
      <InputGroup.Prepend>
        <InputGroup.Text id='basic-addon1'>
          {props.minmax_label} number of answers accepted
        </InputGroup.Text>
      </InputGroup.Prepend>
      <DropdownButton as={InputGroup.Append} variant='outline-secondary'
        title={props.minmax_label === 'Minimum' ? props.min : props.max}
        id='input-group-dropdown-2'
        onSelect={event => {
          props.setMinMax(parseInt(event))
        }}>
        {
          props.options.map((_, index) => {
            if ((props.minmax_label === 'Minimum' && index<=props.max) ||
              (props.minmax_label === 'Maximum' && index>=props.min && index>0))
              return (
                <Dropdown.Item key={index} eventKey={index}>{index}</Dropdown.Item>
              );
            return (<span key={index}></span>);
          })
        }
        {
          ((props.minmax_label === 'Minimum' &&
            parseInt(props.max) === props.options.length) ||
          (props.minmax_label === 'Maximum')) &&
          <Dropdown.Item key={props.options.length} eventKey={props.options.length}>
            {props.options.length}
          </Dropdown.Item>
        }
      </DropdownButton>
    </InputGroup>

  );

}

function ClosedQuestion(props) {

  return (

    <>
      {
        props.options.map((_, index) => {
          return (
            <Option options={props.options} setOptions={props.setOptions}
              key={index+1} option_id={index+1} notValid={props.notValid}/>
          );
        })
      }
      <hr />
      
      <AnswersConstraints minmax_label='Maximum' setMinMax={props.setMax}
        options={props.options} min={props.min} max={props.max}/>
      <AnswersConstraints minmax_label='Minimum' setMinMax={props.setMin}
        options={props.options} min={props.min} max={props.max}/>

    </>


  );

}

function OpenQuestion(props) {

  return (

    <InputGroup className='mb-3'>
      <InputGroup.Prepend>
        <InputGroup.Text id='basic-addon1'>Is this question mandatory?</InputGroup.Text>
      </InputGroup.Prepend>
      <Form.Group
        className={
          `${props.notValid.includes('mandatory') ? 'form-control-errorv2' : ''} q-type`
      }>
        <Form.Check inline label='Yes' type='radio' name='mandatory'
          className='q-type-form-check'
          onChange={
            ev => {
              if (ev.target.checked)
                props.setMandatory('yes');
            }
          }/>
        <Form.Check inline label='No' type='radio' name='mandatory'
          className='q-type-form-check'
          onChange={
            ev => {
              if (ev.target.checked)
                props.setMandatory('no');
            }
          }/>
      </Form.Group>
    </InputGroup>

  );

}

function AddQuestion(props) {
  
  return (
    <>
      <Modal show={props.show} onHide={props.handleClose} backdrop='static' keyboard={false}>

        <Modal.Header closeButton>
          <Modal.Title>Add a new question</Modal.Title>
        </Modal.Header>

        <Form>

          <Modal.Body>

            {props.notValid.length !== 0 && 
              <Alert variant='danger' className='error-alert'>
                Error(s) in the form, please fix it.
              </Alert>}

            <QuestionTitle notValid={props.notValid} question_id={props.lastQId}
              questions={props.questions} setQuestions={props.setQuestions} />    
            <QuestionType setQtype={props.setQtype} setOptions={props.setOptions}
              notValid={props.notValid}/>
            <hr />
            { 
              props.qtype === 'closed' &&
                <ClosedQuestion options={props.options} setOptions={props.setOptions}
                  min={props.min} setMin={props.setMin} max={props.max} setMax={props.setMax}
                  notValid={props.notValid}/>
            }
            {
              props.qtype === 'open' &&
                <OpenQuestion notValid={props.notValid}
                  mandatory={props.mandatory} setMandatory={props.setMandatory}/>
            }

          </Modal.Body>

          <Modal.Footer>

            <Button variant='secondary' onClick={props.handleClose}>
              Cancel
            </Button>

            <Button variant='primary' onClick={props.handleSubmit}>
              Save Changes
            </Button>

          </Modal.Footer>
        </Form>
      </Modal>
    </>

  );

}

export default AddQuestion;