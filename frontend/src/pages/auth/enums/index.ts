export const AUTH_SLICE_NAME = 'auth';
// export const GET_AUTH_ENDPOINT = '/auth';
enum ApiEndpoints {
  LOGIN = '/auth/login',
  VERIFY_LOGIN_OTP = '/auth/login/verify-otp',
  LOGOUT = '/auth/logout',
  FORGOT_PASSWORD = '/auth/forgot-password',
  RESET_PASSWORD = '/auth/reset-password',
  UPLOAD_MY_AVATAR = '/auth/me/avatar',
}
export default ApiEndpoints;
