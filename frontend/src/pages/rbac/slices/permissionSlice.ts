import { createSlice } from '@reduxjs/toolkit';
import { SLICE_NAME } from '../enums';
import { StateSliceTypes } from '../types';
import { getPermissions, savePermission, getAllGroupedPermissions } from './permissionThunks';

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
  permissions: null,

  groupedPermissions: null,
  editPermission: null,
};

const permissionSlice = createSlice({
  name: SLICE_NAME,
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
    setEditPermission(state, action) {
      state.editPermission = action.payload;
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
      // FILTERS
      .addCase(getAllGroupedPermissions.pending, state => {
        state.filterLoading = true;
        state.error = null;
      })
      .addCase(getAllGroupedPermissions.fulfilled, (state, action) => {
        state.filterLoading = false;
        state.error = null;
        state.groupedPermissions = action.payload;
      })
      .addCase(getAllGroupedPermissions.rejected, (state, action) => {
        state.filterLoading = false;
      })

      // LIST
      .addCase(getPermissions.pending, state => {
        state.tableLoading = true;
        state.error = null;
      })
      .addCase(getPermissions.fulfilled, (state, action) => {
        state.tableLoading = false;
        state.error = null;
        state.permissions = action.payload?.data;
        state.tablePagination = action.payload?.pagination;
      })
      .addCase(getPermissions.rejected, state => {
        state.tableLoading = false;
      })

      // CREATE
      .addCase(savePermission.pending, state => {
        state.btnLoading = true;
        state.showError = false;
      })
      .addCase(savePermission.fulfilled, state => {
        state.btnLoading = false;
        state.showError = false;
        state.errors = {};
      })
      .addCase(savePermission.rejected, (state: any, action: any) => {
        state.btnLoading = false;
        state.showError = true;
        state.errors = action.payload?.errors;
      });
  },
});

export const {
  setFilters,
  setSorting,
  setClearSorting,
  clearError,
  setDrawerModel,
  setClearFilters,
  setPageChange,
  setEditPermission,
} = permissionSlice.actions;
export default permissionSlice.reducer;
