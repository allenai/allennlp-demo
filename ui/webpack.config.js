const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const path = require('path');

module.exports = {
    entry: './src/index.tsx',
    module: {
        rules: [
            // This allows for CSS to be included via import statements, like so:
            // `import '@allenai/varnish/dist/theme.css';`
            {
                test: /\.css$/,
                loader: 'style-loader',
            },
            {
                test: /\.css$/,
                loader: 'css-loader',
                options: {
                    // Tell css-loader not to map url() statements to require() statements
                    // that are in turn turned into paths to build artifacts resolved by
                    // file-loader.
                    url: false,
                },
            },
            // This tells webpack to hand TypeScript files to the TypeScript compiler
            // before bundling them.
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(jpg|svg)/,
                loader: 'file-loader',
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        // This copies `public/index.html` into the build output directory.
        new HtmlWebpackPlugin({ template: 'public/index.html' }),
        // This copies everything that isn't `index.html` from `public/` into the build output
        // directory.
        new CopyPlugin({
            patterns: [
                {
                    from: 'public/**/*',
                    filter: (absPathToFile) => {
                        return absPathToFile !== path.resolve(__dirname, 'public', 'index.html');
                    },
                    transformPath: (p) => p.replace(/^public\//, ''),
                },
            ],
        }),
    ],
    output: {
        filename: 'main.[contenthash].js',
        path: path.resolve(__dirname, 'build'),
        publicPath: '/',
    },
    devServer: {
        hot: true,
        host: '0.0.0.0',
        allowedHosts: ['ui', 'allennlp-demo-ui'],
        historyApiFallback: true,
        port: 3000,
        // Apparently webpack's dev server doesn't write files to disk. This makes it hard to
        // debug the build process, as there's no way to examine the output. We change this
        // setting so that it's easier to inspect what's built. This in theory might make things
        // slower, but it's probably worth the extra nanosecond.
        writeToDisk: true,
        lazy: false,
        sockPort: 8080,
    },
    devtool: 'source-map',
};
