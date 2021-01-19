import { createContext } from 'react';

interface ConfigProps {
    /* An application identifier that's used to persist documents associated with shareable URLs. */
    appId: string;
}

export const Config = createContext<ConfigProps>({ appId: 'Unknown' });
