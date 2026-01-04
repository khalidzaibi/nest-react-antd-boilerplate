import { Rule } from 'antd/es/form';
import { allowedModules } from '@/lib/dom';
export const validations: Record<string, Rule[]> = {
  key: [
    { required: true, message: 'Permission key is required' },
    {
      pattern: /^[a-z0-9-]+(\.[a-z0-9-]+)+$/, // keep your existing regex
      message: 'Use module.action (e.g., users.read)',
    },
    {
      validator: (_, value) => {
        if (!value) return Promise.resolve();

        const [module] = value.split('.');
        if (!allowedModules.includes(module)) {
          return Promise.reject(new Error(`Module must be one of: ${allowedModules.join(', ')}`)); //
        }

        return Promise.resolve();
      },
    },
  ],
  label: [{ max: 100, message: 'Max 100 characters' }],
  description: [{ max: 300, message: 'Max 300 characters' }],
};

export const roleValidations: Record<string, Rule[]> = {
  name: [{ required: true, message: 'Role name is required' }],
  description: [{ max: 300, message: 'Max 300 characters' }],
};
