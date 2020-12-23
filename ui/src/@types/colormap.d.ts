/**
 * colormap does not have types: https://www.npmjs.com/package/colormap
 */
declare module 'colormap' {
    const createColorMap: (spec: any) => any;
    export default createColorMap;
}
