import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { fetchUserLoginData } from "../../services";
import { fetchUserLogoutData } from "../../services/modules/user";


export const loginActionCreator = createAsyncThunk("users/login",
  async (userInfo, { rejectWithValue }) => {
    try {
      const response = await fetchUserLoginData(userInfo);
      return response;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
)

export const LogoutActionCreator = createAsyncThunk("users/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchUserLogoutData();
      return response;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
)

const userSlice = createSlice({
  name: "user",
  initialState: {
    userInfo: null,
  },
  reducers: {
  },
  extraReducers: (builder) => {
    builder.addCase(loginActionCreator.fulfilled, (state, {payload}) => {
      state.userInfo = payload;
    });
    builder.addCase(LogoutActionCreator.fulfilled, (state, {payload}) => {
      state.userInfo = payload;
    })
  },
});


export default userSlice.reducer;










