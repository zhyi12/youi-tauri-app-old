import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	plugins: [sveltekit()],

	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					echarts: ['echarts']
				}
			},
		},
	},
};

export default config;
