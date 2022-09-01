
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {findAreaGeoJson} from "$lib/app-services/base/areaServices";

export async function load() {
    console.log('load area geo json ')
    const areaGeo = await findAreaGeoJson("440102000000");

    return {
        areaGeo
    }
}