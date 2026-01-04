import { createAsyncThunk } from '@reduxjs/toolkit';
import { selectPagination } from './pagination';
import { selectSorting } from './sorting';
import { selectFilters } from './filters';
import AxiosInstance from './AxiosInstance';

// type Filters = Record<string, any>;
type Body = Record<string, any>;
type HttpMethod = 'PATCH' | 'PUT';

export const createPostThunk = (sliceName: string, endpoint: string) => {
  return createAsyncThunk(
    `${sliceName}/post${endpoint}`, // name of the thunk
    async (body: Body = {}, thunkAPI) => {
      try {
        const res = await AxiosInstance.post(endpoint, body);
        return res.data;
      } catch (err: any) {
        return thunkAPI.rejectWithValue(err.response?.data || 'Request failed');
      }
    },
  );
};

export const getPaginatedThunk = (sliceName: string, endpoint: string) => {
  return createAsyncThunk(`${sliceName}/fetch${endpoint}`, async (_: void, thunkAPI) => {
    try {
      const { page, perPage } = selectPagination(sliceName)(thunkAPI.getState());
      const { sorting } = selectSorting(sliceName)(thunkAPI.getState());
      const { filters } = selectFilters(sliceName)(thunkAPI.getState());

      const res = await AxiosInstance.get(endpoint, {
        params: { filters: JSON.stringify(filters), sorting: JSON.stringify(sorting), page, perPage },
      });
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || 'Request failed');
    }
  });
};

export const getFilterGetThunk = (sliceName: string, endpoint: string) => {
  return createAsyncThunk(`${sliceName}/filter${endpoint}`, async (_: void, thunkAPI) => {
    try {
      // const { sorting } = selectSorting(sliceName)(thunkAPI.getState());
      const { filters } = selectFilters(sliceName)(thunkAPI.getState());

      const res = await AxiosInstance.get(endpoint, { params: { filters: JSON.stringify(filters) } });
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || 'Request failed');
    }
  });
};

export const getByIdThunk = (sliceName: string, endpoint: string) => {
  return createAsyncThunk(`${sliceName}/getById${endpoint}`, async (id: string, thunkAPI) => {
    try {
      if (!id) {
        throw new Error('ID is required');
      }
      const url = endpoint.includes(':id') ? endpoint.replace(':id', id) : endpoint;
      const res = await AxiosInstance.get(url);
      return res.data;
    } catch (err: any) {
      const errorMessage = err?.response?.data || err?.message || 'Request failed';
      return thunkAPI.rejectWithValue(errorMessage);
    }
  });
};

export const createUpdateThunk = (
  sliceName: string,
  endpoint: string, // e.g. "/permissions/:id"
  method: HttpMethod = 'PATCH', // default PATCH; pass 'PUT' if needed
) => {
  return createAsyncThunk(
    `${sliceName}/update${endpoint}`,
    async (
      data: any, // add { params?: any } if you need query params
      { rejectWithValue },
    ) => {
      try {
        const { id, ...body } = data; // <- id inside form
        const url = endpoint.replace(':id', id);
        const res = await AxiosInstance.request({
          url,
          method,
          data: body,
          withCredentials: true,
        });
        return res.data; // or res.data.data
      } catch (err: any) {
        return rejectWithValue(err?.response?.data || { message: 'Update failed' });
      }
    },
  );
};

export const createDeleteThunk = (sliceName: string, endpoint: string) => {
  return createAsyncThunk(
    `${sliceName}/delete${endpoint}`,
    async (
      data: any, // can be string id or { id: string, params?: any }
      { rejectWithValue },
    ) => {
      try {
        const { id, ...body } = data; // <- id inside form
        const url = endpoint.replace(':id', id);
        const params = body;
        const res = await AxiosInstance.request({
          url,
          method: 'DELETE',
          params, // optional query string
        });

        // If your API wraps payload in successResponse, switch to res.data.data
        return res.data;
      } catch (err: any) {
        return rejectWithValue(err?.response?.data || { message: 'Delete failed' });
      }
    },
  );
};
