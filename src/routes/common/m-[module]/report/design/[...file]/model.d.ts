import {Column} from "$lib/component/cube/DataCube";

export type Model = {

    id?:string,

    text?:string,

    columns?:Column[]

}