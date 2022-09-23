import type {LoadEvent} from "@sveltejs/kit";

export async function load({parent,params}:LoadEvent) {
    const {id,steps} = await parent();
    const isNewQuery = params.file && params.file.endsWith('.create');//是否为新查询
    return {
        isNewQuery,
        id,step:steps[0],

    }
}