import * as types from '../action-types'
import axios from "axios"

function multiplyUser() {
  return {
    type: types.MULTIPLE
  }
}

function changeTitle(title) {
  return {
    type: types.CHANGECONTEXT,
    title
  }
}

function fetchTitleData() {
  return function(diapatch) {
    axios.get("http://123.207.32.32:8000/home/multidata").then(res=>{
      const title=res.data.data.banner.list[0].title;
      diapatch(changeTitle(title));
    })
  }
}

export default {
  multiplyUser,
  fetchTitleData
}