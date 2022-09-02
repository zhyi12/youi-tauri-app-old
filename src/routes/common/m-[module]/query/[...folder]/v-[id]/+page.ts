import type {LoadEvent} from "@sveltejs/kit";

export async function load({parent,params}:LoadEvent) {
    //let steps = [];
    return {
        id:params.id
    }
}