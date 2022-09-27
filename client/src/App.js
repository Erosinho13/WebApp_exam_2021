import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css';

import {useState, useEffect} from 'react';
import {BrowserRouter as Router, Redirect, Route, Switch} from 'react-router-dom';

import NavigationBar from './NavigationBar'
import Login from './login/Login';
import ActiveSurveys from './ActiveSurveys';
import FillSurvey from './survey/id/FillSurvey';
import SurveyResponses from './admin-panel/survey/id/SurveyResponses';
import NewSurvey from './admin-panel/new-survey/NewSurvey';
import AdminPanel from './admin-panel/AdminPanel';
import {Info, Footer} from './utils';
import API from './API';

function App() {

  const [loggedIn, setLoggedIn] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [newSurvey, setNewSurvey] = useState(false);
  const [answering, setAnswering] = useState(false);
  const [surveyStatsFlag, setSurveyStatsFlag] = useState(false);
  //const [initialized, setInitialized] = useState(false);
  //const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [surveys, setSurveys] = useState([]);
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyAuthor, setSurveyAuthor] = useState('');
  const [questions, setQuestions] = useState([]);
  const [numResponses, setNumResponses] = useState([]);

  useEffect(()=> {
    const checkAuth = async() => {
      try {
        // here you have the user info, if already logged in
        // const results = await API.getUserInfo();
        await API.getUserInfo();
        //setUserId(results.id);
        setLoggedIn(true);
      } catch(err) {
      }
      //setInitialized(true);
    };
    checkAuth();
  }, []);

  const doLogIn = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setLoggedIn(true);
      setLoggingIn(false);
      //setUserId(user.id);
      setMessage({msg: `Welcome, ${user.username}!`, type: 'success'});
    } catch (err) {
      setMessage({msg: err, type: 'danger'});
    }
  }

  const doLogOut = async () => {
      await API.logOut();
      setLoggedIn(false);
      setLoggingIn(false);
      // clean up everything
      //setUserId('');
  }

  return (
    <>
      <Router>
        <NavigationBar loggedIn={loggedIn} loggingIn={loggingIn} doLogOut={doLogOut}
          answering={answering} newSurvey={newSurvey} surveyStatsFlag={surveyStatsFlag}/>
        <div className='container-fluid'>
          <div className='vheight-100'>
            <main className='below-nav'>
              {message && 
                <Info variant={message.type} onClose={() => setMessage('')}
                  message={message.msg}/>}
              <Switch>
                <Route path='/login' render={() =>
                  <>
                    {loggedIn ?
                      <Redirect to='/admin-panel' /> :
                      <Login login={doLogIn} setLoggingIn={setLoggingIn} />}
                  </>
                }/>
                <Route exact path='/admin-panel' render={() => 
                  <>
                    {loggedIn ?
                      <AdminPanel setNewSurvey={setNewSurvey}
                        setSurveyStatsFlag={setSurveyStatsFlag} loading={loading}
                        setLoading={setLoading} numResponses={numResponses}
                        setNumResponses={setNumResponses} /> :
                      <Redirect to='/' /> 
                    }
                  </>
                }/>
                <Route exact path='/admin-panel/survey/:id' render={({match}) => 
                  <>
                    {loggedIn ?
                      <SurveyResponses setSurveyStatsFlag={setSurveyStatsFlag}
                        survey_id={match.params.id} /> :
                      <Redirect to='/' /> 
                    }
                  </>
                }/>
                <Route exact path='/admin-panel/new-survey' render={() => 
                  <>
                    {loggedIn ?
                      <NewSurvey setNewSurvey={setNewSurvey} setMessage={setMessage}
                        setNumResponses={setNumResponses}/> :
                      <Redirect to='/' /> 
                    }
                  </>
                }/>
                <Route exact path='/survey/:id' render={({match}) => 
                  <>
                    {loggedIn ? 
                      <Redirect to='/admin-panel' /> :
                      <FillSurvey id={match.params.id} setAnswering={setAnswering}
                        loading={loading} setLoading={setLoading} surveyTitle={surveyTitle}
                        setSurveyTitle={setSurveyTitle} surveyAuthor={surveyAuthor}
                        setSurveyAuthor={setSurveyAuthor} questions={questions}
                        setQuestions={setQuestions} setMessage={setMessage}
                        disabled={false}/>
                    }
                  </>
                }/>
                <Route exact path='/' render={() =>
                  <>
                    {loggedIn ? 
                      <Redirect to='/admin-panel' /> :
                      <ActiveSurveys setLoggingIn={setLoggingIn} setAnswering={setAnswering}
                        loading={loading} setLoading={setLoading} surveys={surveys}
                        setSurveys={setSurveys} />
                    }
                  </>
                }/>
                <Route path='*'>
                  <Redirect to='/' />
                </Route>
              </Switch>
            </main>
          </div>
        </div>
      </Router>
      <Footer />
    </>
  );
}

export default App;
