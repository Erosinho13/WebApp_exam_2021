import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css';

import {Navbar, Button, Col} from 'react-bootstrap';
import {Link} from 'react-router-dom';

import {Logo} from './svgs';

function NavigationBar(props) {

  return (
    <Navbar expand='lg' className='navbar navbar-expand-sm navbar-dark bg-primary fixed-top'>
      
      <Navbar.Brand as={Link} to='/'>
        <span className='navbar-brand' id='symbol'>
          <Logo size='31'/>
        </span>
        <span className='navbar-brand'> The Poller </span>
      </Navbar.Brand> 

      <Navbar.Toggle aria-controls='basic-navbar-nav' />

      <Navbar.Collapse id='basic-navbar-nav'>
        <div className='navbar-nav ml-md-auto'>
          <Col>
            {
              (props.loggingIn || props.answering) ||
              (props.loggedIn && (props.surveyStatsFlag || props.newSurvey)) ?
                <Link to='/' className='btn-mrg-r btn btn-info my-sm-0'>Back</Link> :
                <></>
            }
            {
              !props.loggingIn && !props.loggedIn ? 
                <Link to='/login' className='btn-mrg-r btn btn-mandarin my-sm-0'>
                  Login
                </Link> :
                <></>
            }
            {
              props.loggedIn && !props.newSurvey ?
                <Link to='/admin-panel/new-survey'
                  className='btn-mrg-r btn btn-mandarin my-sm-0'>
                  New survey
                </Link> :
                <></>
            }
            {
              props.loggedIn ?
                <Button className='btn-mrg-r' variant='danger' onClick={props.doLogOut}>
                  Logout
                </Button> :
                <></>
            }
          </Col>
        </div>
      </Navbar.Collapse>
    </Navbar>
  );

}

export default NavigationBar;