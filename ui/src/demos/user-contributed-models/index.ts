/**
 * TODO: If we like the pattern proposed I'll:
 *
 *  1. Modify each `./config` instance to just export a symbol named `config` instead of
 *     `demoConfig`, so we don't have to do this.
 *  2. Modify each `./Main` instance to just `export Main` instead of using `export.default`.
 *
 * Making those changes means we could just `export *` below, instead of remapping the imports
 * to the names the `Demos.load()` API expects.
 */
import { demoConfig as config } from './config';

import Main from './Main';
export { config };
export { Main };
