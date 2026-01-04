import ApiEndpoints, { AUTH_SLICE_NAME } from '../enums/index';
import { createPostThunk } from '@/stores/helpers/genaricThunk';

// Async thunk for login
export const login = createPostThunk(AUTH_SLICE_NAME, ApiEndpoints.LOGIN);
export const verifyLoginOtp = createPostThunk(AUTH_SLICE_NAME, ApiEndpoints.VERIFY_LOGIN_OTP);
// Async thunk for logout
export const logout = createPostThunk(AUTH_SLICE_NAME, ApiEndpoints.LOGOUT);
export const forgotPassword = createPostThunk(AUTH_SLICE_NAME, ApiEndpoints.FORGOT_PASSWORD);
export const resetPassword = createPostThunk(AUTH_SLICE_NAME, ApiEndpoints.RESET_PASSWORD);
export const uploadMyAvatar = createPostThunk(AUTH_SLICE_NAME, ApiEndpoints.UPLOAD_MY_AVATAR);
