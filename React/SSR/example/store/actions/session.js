import * as types from '../action-types'
import axios from 'axios'


function userLogin(data) {
  return function(dispatch, getState, request) {
    return request.post('/api/login', data).then(res => {
      let userData = res.data
      dispatch({
        type: types.SET_SESSION,
        payload: userData.data
      })
    })
  }
}


function userLogout() {
  return function(dispatch, getState, request) {
    return request.get('/api/logout').then(res => {
      let userData = res.data
      dispatch({
        type: types.SET_SESSION,
        payload: userData.data
      })
    })
  }
}


function getUser() {
  return function(dispatch, getState, request) {
    return request.get('/api/users').then(res => {
      let userData = res.data
      dispatch({
        type: types.SET_SESSION,
        payload: userData.data
      })
    })
  }
}





export default {
  userLogin,
  userLogout,
  getUser
}

