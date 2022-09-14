import type { PageLoad } from './$types';

export const load:PageLoad = async ({parent,params}) => {

    const {file,id} = params;

    return {
        file,
        id
    }

}