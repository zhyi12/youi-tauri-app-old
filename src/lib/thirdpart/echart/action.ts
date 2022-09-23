import * as echarts from 'echarts';

export type EChartsOptions = echarts.EChartsOption
export type EChartsTheme = string | object
export type EChartsRenderer = 'canvas' | 'svg'

export type ChartOptions = {
    theme?: EChartsTheme
    renderer?: EChartsRenderer
    options: EChartsOptions
}

const DEFAULT_OPTIONS: Partial<ChartOptions> = {
    theme: undefined,
    renderer: 'canvas',
}
/**
 *
 * @param element
 * @param options
 */
export default function action (element:HTMLElement, chartOptions: ChartOptions) {

    const { theme, renderer, options } = {
        ...DEFAULT_OPTIONS,
        ...chartOptions,
    }

    const echartsInstance = echarts.init(element, theme, { renderer });
    echartsInstance.setOption(options);

    function handleResize() {
        echartsInstance.resize()
    }

    window.addEventListener('resize', handleResize);

    return {
        destroy () {
            echartsInstance.dispose();
            window.removeEventListener('resize',handleResize);
        }
    }
}