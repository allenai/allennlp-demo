export interface DemoConfig {
    group: string;
    title: string;
    order: number;
    status: 'active' | 'hidden' | 'disabled';
    /**
     * The path used to access the demo. If it's not set we make a URL safe version of your
     * title and use that instead.  For instance a title of "My Cool Demo" would be accessible
     * at "/my-cool-demo".
     */
    path?: string;
}
