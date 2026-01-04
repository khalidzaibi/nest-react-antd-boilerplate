import { Rule } from 'antd/es/form';


export const validations: Record<string, Rule[]> = {
  name: [{ required: true, message: 'Name is required' }],
  type: [{ required: true, message: 'Type is required' }],

};
