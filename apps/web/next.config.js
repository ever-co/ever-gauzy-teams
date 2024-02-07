/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const withNextIntl = require('next-intl/plugin')();

console.log(`NEXT_PUBLIC_GAUZY_API_SERVER_URL: ${process.env.NEXT_PUBLIC_GAUZY_API_SERVER_URL}`);

const isProduction = process.env.NODE_ENV === 'production';
const isSentryEnabled = isProduction && process.env.SENTRY_DSN;

const sentryConfig = isSentryEnabled && {
	sentry: {
		// For all available options, see: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

		// Upload a larger set of source maps for prettier stack traces (increases build time)
		widenClientFileUpload: true,

		// Transpiles SDK to be compatible with IE11 (increases bundle size)
		transpileClientSDK: true,

		// Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
		tunnelRoute: '/monitoring',

		// Hides source maps from generated client bundles
		hideSourceMaps: true,

		// Automatically tree-shake Sentry logger statements to reduce bundle size
		disableLogger: true
	}
};
// eslint-disable-next-line @typescript-eslint/no-var-requires
/** @type {import('next').NextConfig} */
const nextConfig = {
	output: process.env.NEXT_BUILD_OUTPUT_TYPE === 'standalone' ? 'standalone' : undefined,
	reactStrictMode: false,
	swcMinify: true,
	webpack: (config, { isServer }) => {
		config.resolve.alias['@app'] = path.join(__dirname, 'app');
		config.resolve.alias['@components'] = path.join(__dirname, 'components');
		config.resolve.alias['app'] = path.join(__dirname, 'app');
		config.resolve.alias['components'] = path.join(__dirname, 'components');
		config.resolve.alias['lib'] = path.join(__dirname, 'lib');
		return config;
	},
	images: {
		domains: [
			'dummyimage.com',
			'res.cloudinary.com',
			'localhost',
			'127.0.0.1',
			'cdn-icons-png.flaticon.com', // Remove this domain once the Backend Icons list is added
			'api.gauzy.co',
			'apidev.gauzy.co',
			'apistage.gauzy.co',
			'api.ever.team',
			'apidev.ever.team',
			'gauzy.s3.wasabisys.com',
			'gauzystage.s3.wasabisys.com'
		]
	},
	...sentryConfig
};

// Injected content via Sentry wizard below
// const { withSentryConfig } = require('@sentry/nextjs');

// const sentryWebpackPluginOptions = {
// 	org: process.env.SENTRY_ORG || 'ever-co',
// 	project: process.env.SENTRY_PROJECT || 'ever-teams-web',

// 	// An auth token is required for uploading source maps.
// 	authToken: process.env.SENTRY_AUTH_TOKEN,

// 	silent: true, // Suppresses all logs

// 	dryRun: process.env.NODE_ENV !== 'production'

// 	// Additional config options for the Sentry Webpack plugin.
// 	// Keep in mind that https://github.com/getsentry/sentry-webpack-plugin#options.
// };

// Make sure adding Sentry options is the last code to run before exporting
// module.exports = process.env.NODE_ENV === "production" && process.env.SENTRY_DSN
// 	? withSentryConfig(nextConfig, sentryWebpackPluginOptions) : nextConfig

module.exports = withNextIntl(nextConfig);
