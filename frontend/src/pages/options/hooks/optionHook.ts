import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { getOptions, getFilteredOptions, saveOption, getOptionsWithProvidedTypes, updateOption } from '../slices/optionThunks';
import {
  clearError,
  setDrawerModel,
  setEditModel,
  setClearFilters,
  setPageChange,
  setFilters,
  setSorting,
  setClearSorting,
  setAdvancedFilterToggle,
} from '../slices/optionSlice';
import { stateSliceTypes, OptionFormType } from '../types';
import { SLICE_NAME } from '../enums';

export const useOptionHook = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => <stateSliceTypes>state[SLICE_NAME]);

  return {
    ...state,
    getOptionsWithProvidedTypes: async (data: any) => {
      return dispatch(getOptionsWithProvidedTypes(data)).unwrap();
    },
    getOptions: async () => {
      return dispatch(getOptions()).unwrap();
    },
    getFilteredOptions: async () => {
      return dispatch(getFilteredOptions()).unwrap();
    },
    saveOption: async (data: OptionFormType) => {
      return dispatch(saveOption(data)).unwrap();
    },
    updateOption: async (data: OptionFormType) => {
      return dispatch(updateOption(data)).unwrap();
    },
    clearError: () => dispatch(clearError()),
    setClearFilters: () => dispatch(setClearFilters()),
    setDrawerModel: (data: boolean) => dispatch(setDrawerModel(data)),
    setEditModel: (data: any) => dispatch(setEditModel(data)),
    setPageChange: (data: { page?: number; perPage?: number }) => dispatch(setPageChange(data)),
    setSorting: (data: any) => dispatch(setSorting(data)),
    setFilters: (data: any) => dispatch(setFilters(data)),
    setClearSorting: () => dispatch(setClearSorting()),
    setAdvancedFilterToggle: (data: boolean) => dispatch(setAdvancedFilterToggle(data)),
  };
};
