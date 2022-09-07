import type {LoadEvent} from "@sveltejs/kit";

export async function load({parent}:LoadEvent) {
    const {id,steps} = await parent();
    return {
        id,step:steps[0]
    }
}