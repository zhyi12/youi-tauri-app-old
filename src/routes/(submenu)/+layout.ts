import type {LayoutLoad,LayoutLoadEvent} from './$types';

/**
 *
 */
export const load: LayoutLoad = async ({parent,url}:LayoutLoadEvent) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { menus,activeModule,appConfig } = await parent();
    const {pathname} = url;

    return {
        menus,activeModule,appConfig,pathname
    }

}