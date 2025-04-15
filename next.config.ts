import type { NextConfig } from "next";
import type { Configuration, RuleSetRule } from "webpack";

const nextConfig: NextConfig = {
    webpack(config) {
        // Grab the existing rule that handles SVG imports
        const fileLoaderRule = config.module.rules.find((rule: RuleSetRule) => {
            if (rule.test instanceof RegExp) {
                return rule.test.test('.svg');
            }
            return false;
        });

        if (!fileLoaderRule) {
            throw new Error('Could not find file loader rule for SVG');
        }

        config.module.rules.push(
            // Reapply the existing rule, but only for svg imports ending in ?url
            {
                ...fileLoaderRule,
                test: /\.svg$/i,
                resourceQuery: /url/, // *.svg?url
            },
            // Convert all other *.svg imports to React components
            {
                test: /\.svg$/i,
                issuer: fileLoaderRule.issuer,
                resourceQuery: { not: [...(fileLoaderRule.resourceQuery?.not || []), /url/] }, // exclude if *.svg?url
                use: ['@svgr/webpack'],
            },
        );

        // Modify the file loader rule to ignore *.svg, since we have it handled now.
        fileLoaderRule.exclude = /\.svg$/i;

        return config;
    },
};

// Merge configs
const finalConfig = {
    ...nextConfig,
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'www.fermax.com',
                pathname: '**'
            },
            {
                protocol: 'https',
                hostname: 'www.golmar.es',
                pathname: '**'
            },
            {
                protocol: 'https',
                hostname: 'www.golmar-seguridad.es',
                pathname: '**'
            },
            {
                protocol: "https",
                hostname: "**",
            },
            {
                protocol: "http",
                hostname: "**",
            },
            {
                protocol: 'https',
                hostname: 'golmar.es',
                pathname: '**'
            },
            {
                protocol: 'https',
                hostname: 'drive.google.com',
                pathname: '**'
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                pathname: '**'
            },
            {
                protocol: 'https',
                hostname: 'www.legrand.es',
                pathname: '**'
            }
        ]
    },
};

export default finalConfig;