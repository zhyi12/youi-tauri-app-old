/**
 * 天地图token da289cb6acc5479ea6ab4b225042d8a4
 * @param tdtToken
 * @returns {{sources: {tiles: string[], tileSize: number, type: string}, layers: [{maxzoom: number, id: string, source: string, type: string, minzoom: number}], version: number}}
 */
export const tdtStyle = (tdtToken) => {
    let vec_tiles = [];
    let cva_tiles = [];
    let serverCount = 8;

    for(let i=0;i<serverCount;i++){
        vec_tiles.push(`http://t${i}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${tdtToken}`);
        cva_tiles.push(`http://t${i}.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${tdtToken}`);
    }

    return {
        version: 8,
        sources: {
            "raster-tiles":{
                type: "raster",
                tiles: vec_tiles,
                tileSize: 256
            },
            "raster-tiles-annotation":{
                type: "raster",
                tiles: cva_tiles,
                tileSize: 256
            }
        },
        layers: [{
            "id": "tdt-vec-tiles",
            "type": "raster",
            "source": "raster-tiles",
            minzoom: 0,
            maxzoom: 22
        },{
            "id": "tdt-annotation-tiles",
            "type": "raster",
            "source": "raster-tiles-annotation",
            minzoom: 0,
            maxzoom: 22
        }]
    }
};