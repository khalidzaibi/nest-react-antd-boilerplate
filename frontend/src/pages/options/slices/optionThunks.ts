import ApiEndpoints, { SLICE_NAME } from '../enums/index';
import {
    createPostThunk,
    getPaginatedThunk,
    getFilterGetThunk,
    createUpdateThunk,
} from '@/stores/helpers/genaricThunk';


// Async thunk for fetching options
export const getOptions = getPaginatedThunk(SLICE_NAME, ApiEndpoints.OPTIONS);
export const getFilteredOptions = getFilterGetThunk(SLICE_NAME, ApiEndpoints.OPTIONS);

// Async thunk for creating/updating options
export const saveOption = createPostThunk(SLICE_NAME, ApiEndpoints.SAVE_OPTIONS);
export const updateOption = createUpdateThunk(SLICE_NAME, ApiEndpoints.UPDATE_OPTION);
export const getOptionsWithProvidedTypes = createPostThunk(SLICE_NAME, ApiEndpoints.GET_OPTIONS_WITH_PROVIDED_TYPES);
