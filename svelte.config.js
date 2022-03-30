import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';
import { viteMockServe } from "vite-plugin-mock";

const dev = process.env.NODE_ENV === 'development';

/** @type {import('@sveltejs/kit').PrerenderErrorHandler} */
const handleError = ({ status, path, referrer, referenceType }) => {
	console.warn(`${status} ${path}${referrer ? ` (${referenceType} from ${referrer})` : ''}`);
};

const config = {
	//
	preprocess: preprocess(),
	//
	kit: {

		adapter: adapter(),

		// paths: {
		// 	base: dev ? '' : '',
		// },

		prerender: {
			onError: handleError
		},

		vite: {
			plugins:[
				viteMockServe({
					supportTs: false
				})
			]
		},
	}
};

export default config;
