import slug from 'slug';

import { Demo } from './Demo';
import { DemoConfig } from './DemoConfig';

/**
 * TODO: Figure out how the mechanism will work when this code is distributed as it's own module.
 *
 * The code below uses a webpack specific extension of NodeJS's `require()`.
 * See: https://webpack.js.org/api/module-methods/#requirecontext
 *
 * The `require.context()` function cannot be called in a nested function. It must be executed as
 * the file is imported, since at build time it's mapped to the actual files on disk that it
 * points to.
 *
 * It also appears that the path *must* be a hard-coded string, as an attempt to use an
 * environment variable caused runtime errors.
 *
 * This means that if we use this approach users won't be able to override the location of
 * their demos. They'll be forced to place them where this code is hard-coded to look.
 *
 * When we package this up as a separate NPM module we'd probably change `'../demos'`
 * below to `'../../../src/demos'`, assuming the module is published as `@allenai/varnish`, which
 * means it'll be installed at `node_modules/allenai/varnish` and that `node_modules` lives
 * at the root of their application.
 *
 * It's worth noting that npm and yarn tolerate moving where `node_modules` is, in which case
 * the above mentioned mechanism will stop working. Maybe that's ok, given it's *very* unlikely
 * one of our users will do this.
 *
 */
const ctx = require.context('../demos', true, /\/index\.ts$/);

class ConfigError extends Error {
    constructor(message: string) {
        super(`Configuration Error: ${message}`);
    }
}

class DemoList {
    constructor(readonly demos: Demo[]) {}
    all() {
        return this.demos;
    }

    forGroup(label: string) {
        return this.demos.filter((d) => d.config.group === label);
    }
}

export const Demos = {
    /**
     * Returns a list of demos from `src/demos`. Each demo is defined by a directory there that
     * contains an `index.ts` file which exports two things:
     *
     * 1. A symbol named `Main` that is a `React.Component` that's responsible for rendering the
     *    user-interface.
     *
     * 2. A symbol named `config` that is an instance of `tugboat.DemoConfig`.
     *
     * If an `index.ts` file exists and doesn't export both of these symbols, a `ConfigError`
     * is thrown.
     */
    load(): DemoList {
        const demos: Demo[] = [];
        for (const path of ctx.keys()) {
            const d = ctx(path);
            if (!('Main' in d)) {
                throw new ConfigError(`${path}/Main.tsx doesn't exist.`);
            }
            if (!('config' in d)) {
                throw new ConfigError(`${path}/config.ts doesn't exist`);
            }

            const config: DemoConfig = d.config;

            // If there isn't a path, we generate a URL safe version of the title and use that.
            if (!config.path) {
                config.path = `/${slug(config.title, '-')}`;
            }

            // We prefix demos that are hidden from view with a prefix that makes them harder to
            // find. Someone can still access them, they're just less likely to.
            if (config.status === 'hidden') {
                config.path = `/hidden${config.path}`;
            }

            demos.push({ Component: d.Main, config });
        }
        return new DemoList(demos.sort((a, b) => a.config.order - b.config.order));
    },
};
