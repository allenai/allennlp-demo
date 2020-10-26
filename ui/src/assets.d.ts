/**
 * This tells TypeScript to ignore imports targeted at SVGs, which are ultimately resolved
 * via webpack at build time.
 *
 * TODO: Longer term the SVGs used in the repository should be converted to inline SVGs so that
 * this, nor the webpack `file-loader` are necessary.
 */
declare module "*.svg" {
    const content: any;
    export default content;
}
