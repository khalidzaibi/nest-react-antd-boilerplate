import { createSlice } from '@reduxjs/toolkit';
import { SLICE_NAME_ROLES } from '../enums';
import { StateSliceTypes } from '../types/rolesInterface';
import { getRoles, saveRole } from './roleThunks';

const initialState = <StateSliceTypes>{
  tableLoading: false,
  btnLoading: false,
  filterLoading: false,
  error: null,
  errors: {},
  showError: false,
  filters: {},
  sorting: {},
  drawerModel: false,
  tablePagination: {},
  roles: null,
  editRole: null,
};

const roleSlice = createSlice({
  name: SLICE_NAME_ROLES,
  initialState,
  reducers: {
    setFilters(state, action) {
      const payload = action.payload;
      state.filters = {
        ...state.filters,
        ...payload,
      };
    },
    setSorting(state, action: { payload: { column: string; order: 'asc' | 'desc' | null } }) {
      const { column, order } = action.payload;
      if (order) {
        state.sorting = { [column]: order };
      } else {
        state.sorting = {}; // clear sorting
      }
    },
    setClearSorting(state) {
      state.sorting = {};
    },
    setEditRole(state, action) {
      state.editRole = action.payload;
    },
    setClearFilters(state) {
      state.filters = {};
    },
    setDrawerModel(state, action) {
      state.drawerModel = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    setPageChange(state, action) {
      const { page, perPage } = action.payload || {};
      if (page !== undefined) state.tablePagination.page = page;
      if (perPage !== undefined) state.tablePagination.perPage = perPage;
    },
  },
  extraReducers: builder => {
    builder
      // LIST
      .addCase(getRoles.pending, state => {
        state.tableLoading = true;
        state.error = null;
      })
      .addCase(getRoles.fulfilled, (state, action) => {
        state.tableLoading = false;
        state.error = null;
        state.roles = action.payload?.data;
        state.tablePagination = action.payload?.pagination;
      })
      .addCase(getRoles.rejected, state => {
        state.tableLoading = false;
      })

      // CREATE
      .addCase(saveRole.pending, state => {
        state.btnLoading = true;
        state.showError = false;
      })
      .addCase(saveRole.fulfilled, state => {
        state.btnLoading = false;
        state.showError = false;
        state.errors = {};
      })
      .addCase(saveRole.rejected, (state: any, action: any) => {
        state.btnLoading = false;
        state.showError = true;
        state.errors = action.payload?.errors;
      });
  },
});

export const {
  setClearSorting,
  setFilters,
  setSorting,
  clearError,
  setDrawerModel,
  setClearFilters,
  setPageChange,
  setEditRole,
} = roleSlice.actions;

export default roleSlice.reducer;
