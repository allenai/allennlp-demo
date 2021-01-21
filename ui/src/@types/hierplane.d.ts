/**
 * hierplane does not have types
 */
declare module 'hierplane' {
    const Tree: <T extends {}>(tree: T, theme?: string) => JSX.Element;
    export { Tree };
}
