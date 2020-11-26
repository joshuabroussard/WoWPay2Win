'use strict'

import { merge } from 'webpack-merge'
import { VueLoaderPlugin } from 'vue-loader'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'

import CommonConfig from './webpack.config.common'
import { isDev, staticDir, srcWebDir, distWebDir } from './webpack.constants'

// ----------------------------------------------------------------------------
// Web
// ----------------------------------------------------------------------------

export default merge(CommonConfig, {
    target: 'web',

    context: srcWebDir,
    entry: {
        main: 'main.ts',
    },
    output: {
        path: distWebDir,
        filename: isDev
            ? '[name].js'
            : '[name].[contenthash].js',
    },

    devServer: {
        contentBase: [
            staticDir, // Static assets
            distWebDir, // Auctions data files
        ],
    },

    plugins: [
        !isDev && new CopyWebpackPlugin({
            patterns: [
                {
                    from: staticDir,
                },
            ],
        }),
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            template: 'index.html',
        }),
        new HtmlWebpackPlugin({
            template: '404.html',
            filename: '404.html',
        }),
    ].filter(Boolean),
})
