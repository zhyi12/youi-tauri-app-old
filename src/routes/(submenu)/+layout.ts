/**
 *
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export async function load({parent,url}) {
    const { menus,activeModule,appConfig } = await parent();
    const {pathname} = url;

    return {
        menus,activeModule,appConfig,pathname
    }

}