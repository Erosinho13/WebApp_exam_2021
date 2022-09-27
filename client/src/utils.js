import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css';

import {Card, Row, Alert, Navbar, ListGroup} from 'react-bootstrap';
import {Link} from 'react-router-dom';

function Headline(props) {

  return (
    <Card bg={'light'} text={'dark'} className='mb-2'>
      <Card.Body>
        <Card.Title>{props.title}</Card.Title>
        <Card.Text>{props.subtitle}</Card.Text>
      </Card.Body>
    </Card>
  );

}

function Info(props) {
  return (
    <Row>
      <Alert className='alert' variant={props.variant}
        onClose={props.onClose} dismissible>
        {props.message}
      </Alert>
    </Row>
  );
}

function SurveyRow(props) {

  const variants = ['oddrows', 'rightrows'];

  return (
    <ListGroup.Item variant={variants[props.id%2]} as={Link} to={props.linkTo}> 
      <Navbar variant={variants[props.id%2]}>
        <Navbar.Brand className='responsive-text'>{props.title}</Navbar.Brand>
        <Navbar.Collapse className='justify-content-end'>
          <Navbar.Text> {props.text} </Navbar.Text>
        </Navbar.Collapse>
      </Navbar>
    </ListGroup.Item>

  );

}

function Footer() {

  return (
    <Navbar variant='grey-light' className='navbar-expand-sm navbar-fixed-bottom'>
      <Navbar.Text className='small'>
        Politecnico di Torino <br />
        01TXYSM - <b>Web Application I</b> <br />
        Course manager: Prof. <b>Fulvio Corno</b>
      </Navbar.Text>
      <Navbar.Collapse className='justify-content-end'>
        <Navbar.Text>
          s269781 - <b>Eros Fanì</b>
        </Navbar.Text>
      </Navbar.Collapse>
    </Navbar>
  );

}

export {Headline, Info, SurveyRow, Footer};