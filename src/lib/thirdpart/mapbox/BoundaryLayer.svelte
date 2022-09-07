<script>
    import {getContext, onMount} from "svelte";
    import {contextKey} from "./mapbox";

    const { getMap, getMapbox } = getContext(contextKey)
    const map = getMap()
    const mapbox = getMapbox();

    export let name = 'geo_json_layer';
    export let geoJson = undefined;

    onMount(() => {
        if(geoJson.features && geoJson.features.length){
            map.addSource(name,{
                type:'geojson',
                data:geoJson
            });
            map.addLayer({
                id:name,
                type:'line',
                source:name,
                paint:{
                    'line-color': '#000',
                    'line-width': 3
                }
            });

            return ()=>{
                map.removeLayer(name);
                map.removeSource(name);
            }
        }
    });

</script>