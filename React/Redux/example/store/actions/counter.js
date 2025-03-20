import * as types from '../action-types'
import axios from 'axios'

function addNumber() {
  return {
    type: types.ADD
  }
}

function changeImage(image) {
  return {
    type: types.CHANGEIMAGE,
    image
  }
}

function fetchImageData() {
  return function(diapatch) {
    axios.get("http://123.207.32.32:8000/home/multidata").then(res => {
      const image = res.data.data.banner.list[0].image;
      diapatch(changeImage(image));
    })
  }
}


export default {
  addNumber,
  fetchImageData,
}