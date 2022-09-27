async function logIn(credentials) {
  let response = await fetch('/api/sessions', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return {
      'username': user.username,
      'id': user.id
    };
  }
  else {
    try {
      const errDetail = await response.json();
      throw errDetail.message;
    }
    catch (err) {
      throw err;
    }
  }
}

async function logOut() {
  await fetch('/api/sessions/current', {method: 'DELETE'});
}

async function getSurveys() {

  const response = await fetch(`/api/surveys`, {'method': 'GET', 'headers': {}})

  // Error handling
  if (!response.ok) {
    throw Error(response.statusText);
  }

  let type = response.headers.get('Content-type');
  if (!type.includes('application/json'))
      throw new TypeError(`Expected JSON, got ${type}`);

  const surveysList = await response.json();

  return surveysList;
  
}

async function getSurveyById(survey_id) {

  const response = await fetch(`/api/survey/${survey_id}`, {'method': 'GET', 'headers': {}})

  // Error handling
  if (!response.ok)
    return 'not found';

  let type = response.headers.get('Content-type');
  if (!type.includes('application/json'))
      throw new TypeError(`Expected JSON, got ${type}`);

  const survey = await response.json();

  return survey;
  
}

async function getNumResponses() {

  const response = await fetch('/api/surveys/num_responses', {'method': 'GET', 'headers': {}})

  // Error handling
  if (!response.ok)
    throw Error(response.statusText);

  let type = response.headers.get('Content-type');
  if (!type.includes('application/json'))
      throw new TypeError(`Expected JSON, got ${type}`);

  const responses = await response.json();

  return responses;
  
}

async function getQuestions(survey_id) {

  const response = await fetch(`/api/survey/${survey_id}/questions`, 
    {'method': 'GET', 'headers': {}})

  // Error handling
  if (!response.ok)
    return 'not found';

  let type = response.headers.get('Content-type');
  if (!type.includes('application/json'))
      throw new TypeError(`Expected JSON, got ${type}`);

  const questionsList = await response.json();

  return questionsList;
  
}

async function getSurveyAnswers(survey_id) {

  const response = await fetch(`/api/survey/${survey_id}/answers`, 
    {'method': 'GET', 'headers': {}})

  // Error handling
  if (!response.ok)
    throw Error(response.statusText);

  let type = response.headers.get('Content-type');
  if (!type.includes('application/json'))
      throw new TypeError(`Expected JSON, got ${type}`);

  const answers = await response.json();

  return answers;
  
}

async function submitSurveyAnswers(filling) {
  
  const response = await fetch(`/api/survey/${filling.survey_id}`,
    {
        method: 'POST', 'headers': {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filling)
    });

  // Error handling
  if (!response.ok)
    throw Error(response.statusText);

  return response;

}

async function submitNewSurvey(survey) {

  const response = await fetch(`/api/survey`,
    {
        method: 'POST', 'headers': {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(survey)
    });

  // Error handling
  if (!response.ok)
    throw Error(response.statusText);

  return response;

}


const API = {logIn, logOut, getSurveys, getSurveyById, getQuestions, submitSurveyAnswers,
  getNumResponses, getSurveyAnswers, submitNewSurvey};

export default API;