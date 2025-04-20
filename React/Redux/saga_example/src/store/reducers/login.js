
const iniState = {
  userinfo: 1,
}


export default function (state = iniState, action) {
  switch(action.type) {
    case 'login':
      return {...state, userinfo: state.userinfo + 5};
    default:
      return {...state};
  }
}