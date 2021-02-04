import { createContext } from 'react';

import { FormInstance } from 'antd/lib/form';

/**
 * Context that provides access to a parent `<Form />`. See:
 * ../components/form/Form.tsx.
 */
export const Form = createContext<FormInstance | undefined>(undefined);
