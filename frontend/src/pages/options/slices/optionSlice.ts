import { createSlice } from '@reduxjs/toolkit';
import { SLICE_NAME } from '../enums';
import { getOptions, getFilteredOptions, saveOption, getOptionsWithProvidedTypes, updateOption } from './optionThunks';
import { stateSliceTypes } from '../types';

const initialState = <stateSliceTypes>{
  tableLoading: false,
  btnLoading: false,
  filterLoading: false,
  advancedFilterOpen: false,
  advancedFilterLoading: false,

  error: null,
  errors: {},
  showError: false,
  filters: {},
  sorting: {},
  drawerModel: false,
  editModel: null,
  tablePagination: {},
  options: null,
  filteredOptions: null,
  typeWithOptions: {},
};

const optionSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    setAdvancedFilterToggle(state, action) {
      state.advancedFilterOpen = action.payload;
    },
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
    setClearFilters(state) {
      state.filters = {};
    },
    setDrawerModel(state, action) {
      state.drawerModel = action.payload;
    },
    setEditModel(state, action) {
      state.editModel = action.payload;
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
      .addCase(getOptionsWithProvidedTypes.pending, state => {
        state.filterLoading = true;
        state.error = null;
        state.typeWithOptions = {};
      })
      .addCase(getOptionsWithProvidedTypes.fulfilled, (state, action) => {
        state.filterLoading = false;
        state.error = null;
        state.typeWithOptions = action.payload?.data;
      })
      .addCase(getOptionsWithProvidedTypes.rejected, (state, action) => {
        state.filterLoading = false;
      })
      .addCase(getOptions.pending, state => {
        state.tableLoading = true;
        state.error = null;
      })
      .addCase(getOptions.fulfilled, (state, action) => {
        state.tableLoading = false;
        state.error = null;
        state.options = action.payload?.data;
        state.tablePagination = action.payload?.pagination;
      })
      .addCase(getOptions.rejected, (state, action) => {
        state.tableLoading = false;
        // state.error = action.payload?.message;
      })

      .addCase(getFilteredOptions.pending, state => {
        state.filterLoading = true;
        state.error = null;
      })
      .addCase(getFilteredOptions.fulfilled, (state, action) => {
        state.error = null;
        state.filterLoading = false;
        state.filteredOptions = action.payload?.data;
      })
      .addCase(getFilteredOptions.rejected, (state, action) => {
        state.filterLoading = false;
        // state.error = action.payload?.message;
      })
      .addCase(saveOption.pending, state => {
        state.btnLoading = true;
        state.showError = false;
      })
      .addCase(saveOption.fulfilled, (state, action) => {
        state.btnLoading = false;
        state.showError = false;
        state.errors = {};
      })
      .addCase(saveOption.rejected, (state, action: any) => {
        state.btnLoading = false;
        state.showError = true;
        state.errors = action.payload?.errors;
      })
      .addCase(updateOption.pending, state => {
        state.btnLoading = true;
        state.showError = false;
      })
      .addCase(updateOption.fulfilled, state => {
        state.btnLoading = false;
        state.showError = false;
        state.errors = {};
      })
      .addCase(updateOption.rejected, (state, action: any) => {
        state.btnLoading = false;
        state.showError = true;
        state.errors = action.payload?.errors;
      });
  },
});

export const {
  setAdvancedFilterToggle,
  setClearSorting,
  setSorting,
  setFilters,
  clearError,
  setDrawerModel,
  setEditModel,
  setClearFilters,
  setPageChange,
} = optionSlice.actions;
export default optionSlice.reducer;
