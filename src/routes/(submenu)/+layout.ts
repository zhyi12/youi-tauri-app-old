/**
 *
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export async function load({parent}) {

    const { menus,activeModule } = await parent();

    return {
        menus,activeModule
    }

}