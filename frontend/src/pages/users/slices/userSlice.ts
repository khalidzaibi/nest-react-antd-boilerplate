import { createSlice } from '@reduxjs/toolkit';
import { SLICE_NAME } from '../enums';
import { getUsers, saveUser, updateUser, getFilteredUsers, getUserPermissions, changeMyPassword } from './userThunks';
import { stateSliceTypes } from '../types';
import { getAuth, setAuth } from '@/lib/authHelpers';

const initialState = <stateSliceTypes>{
  tableLoading: false,
  btnLoading: false,
  filterLoading: false,

  error: null,
  errors: {},
  showError: false,
  users: null,
  filters: {},
  sorting: {},
  drawerModel: false,
  importDrawerModel: false,
  tablePagination: {},
  filteredUsers: null,
  advancedFilterOpen: false,

  selectedModel: null,
  specialPermissionsDrawer: false,
  rolePermissions: [],
  specialPermissions: [],
};

const accountSlice = createSlice({
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
    setAdvancedFilter(state, action) {
      state.advancedFilterOpen = action.payload;
    },
    setEditModel(state, action) {
      state.selectedModel = action.payload;
    },
    setClearFilters(state) {
      state.filters = {};
    },
    setDrawerModel(state, action) {
      state.drawerModel = action.payload;
    },
    setImportDrawerModel(state, action) {
      state.importDrawerModel = action.payload;
    },
    setSpecialPermissionsDrawer(state, action) {
      state.specialPermissionsDrawer = action.payload;
    },
    setRolePermissions(state, action) {
      state.rolePermissions = action.payload || [];
    },
    setSpecialPermissions(state, action) {
      state.specialPermissions = action.payload || [];
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

      .addCase(getFilteredUsers.pending, state => {
        state.filterLoading = true;
      })
      .addCase(getFilteredUsers.fulfilled, (state, action) => {
        state.filterLoading = false;
        state.filteredUsers = action.payload?.data;
      })
      .addCase(getFilteredUsers.rejected, (state, action) => {
        state.filterLoading = false;
      })
      .addCase(updateUser.pending, state => {
        state.btnLoading = true;
        state.errors = {};
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.btnLoading = false;
        state.errors = {};
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.btnLoading = false;
        state.errors = action.payload as object;
      })
      .addCase(saveUser.pending, state => {
        state.btnLoading = true;
        state.errors = {};
      })
      .addCase(saveUser.fulfilled, (state, action) => {
        state.btnLoading = false;
        state.errors = {};
      })
      .addCase(saveUser.rejected, (state, action) => {
        state.btnLoading = false;
        state.errors = action.payload as object;
      })
      .addCase(getUsers.pending, state => {
        state.tableLoading = true;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.tableLoading = false;
        state.users = action.payload.data;
        state.tablePagination = action.payload.pagination;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.tableLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getUserPermissions.fulfilled, (state, action) => {
        const payload = action.payload?.data || action.payload || {};
        state.rolePermissions = payload.rolePermissions || [];
        state.specialPermissions = payload.specialPermissions || [];
      })
      .addCase(changeMyPassword.fulfilled, state => {
        const auth = getAuth();
        if (auth?.user) {
          setAuth({ ...auth, user: { ...auth.user, isPasswordChanged: true } });
        }
      });
  },
});

export const {
  setClearSorting,
  setFilters,
  setSorting,
  clearError,
  setDrawerModel,
  setImportDrawerModel,
  setSpecialPermissionsDrawer,
  setRolePermissions,
  setSpecialPermissions,
  setClearFilters,
  setPageChange,
  setEditModel,
  setAdvancedFilter,
} = accountSlice.actions;
export default accountSlice.reducer;
