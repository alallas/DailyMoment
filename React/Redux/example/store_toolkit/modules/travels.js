import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchChangedTravelsData, fetchDeletedTravelsData } from "../../services/modules/travels";


export const getChangedTravelsData=createAsyncThunk(
  "getChangedTravelsData",
  async (travelsAuditData,{rejectWithValue})=>{
    try {
      const response = await fetchChangedTravelsData(travelsAuditData);
      return response;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
)

export const getDeletedTravelsData=createAsyncThunk(
  "getDeletedTravelsData",
  async (id,{rejectWithValue})=>{
    try{
      const response = await fetchDeletedTravelsData(id);
      return response;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
)

const travelsSlice = createSlice({
  name: "travels",
  initialState: {
    travelsList: {},
  },
  reducers: {
  },
  extraReducers: (builder) => {
    builder.addCase(getChangedTravelsData.fulfilled, (state, { payload }) => {
      state.travelsList = payload;
    });
    builder.addCase(getDeletedTravelsData.fulfilled, (state, { payload }) => {
      state.travelsList = payload;
    });
  }
});

export default travelsSlice.reducer;









