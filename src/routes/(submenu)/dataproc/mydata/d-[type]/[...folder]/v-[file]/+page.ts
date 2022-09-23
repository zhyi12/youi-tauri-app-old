import type { PageLoad } from './$types';

export const load: PageLoad = async ({parent,params}) => {
    return {
        folder:params.folder,
        file:params.file,
        type:params.type
    }
}