import { Rule } from 'antd/es/form';

export const validations: Record<string, Rule[]> = {
  name: [{ required: true, message: 'Please enter the name' }],
  email: [
    { required: true, message: 'Please enter the email' },
    { type: 'email', message: 'Please enter a valid email' },
  ],
  passwordHash: [
    { required: true, message: 'Please enter the password' },
    { min: 6, message: 'Password must be at least 6 characters' },
  ],
  confirmPassword: [
    { required: true, message: 'Please confirm the password' },
    ({ getFieldValue }) => ({
      validator(_, value) {
        if (!value || getFieldValue('passwordHash') === value) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('Passwords do not match'));
      },
    }),
  ],
  roles: [{ required: false, message: 'Please select at least one role' }],
  status: [{ required: false, message: 'Please select the status' }],
};
