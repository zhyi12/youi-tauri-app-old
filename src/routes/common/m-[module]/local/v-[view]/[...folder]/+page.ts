import type {LoadEvent} from "@sveltejs/kit";
import {metadatas} from "$lib/tauri/tauri.fs";
import type {Metadata} from "$lib/tauri/tauri.fs";

export async function load({params,parent,routeId}:LoadEvent) {
    const baseDir = "/Volumes/D/youi-app-data";

    const folder = params.folder === 'top'?'':params.folder;
    const view = params.view;
    const folderPath = `${baseDir}/${folder}`;
    const metas:Array<Metadata> = await metadatas(folderPath);

    const folderUri = `/common/m-${params.module}/local/v-${view}/${folder}`;

    return {
        view,
        folder,
        baseDir,
        folderUri,
        folderPath,
        metas
    }
}