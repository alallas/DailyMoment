import { configureStore } from '@reduxjs/toolkit'
import userReducer from './modules/user'
import travelsReducer from './modules/travels'

const store = configureStore({
  reducer: {
    user: userReducer,
    travels: travelsReducer,
  }
})

export default store