import type {LoadEvent} from "@sveltejs/kit";
import {findContent} from "$lib/app-services/dmp/customQueryServices";

export async function load({params}:LoadEvent) {
    return {
        id:params.id,
    }
}