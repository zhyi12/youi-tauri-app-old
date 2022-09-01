
<script>
    import MapBox from "$lib/thirdpart/mapbox/MapBox.svelte";
    import NavigationControl from "$lib/thirdpart/mapbox/controls/NavigationControl.svelte";
    import ScaleControl from "$lib/thirdpart/mapbox/controls/ScaleControl.svelte";
    import Marker from "$lib/thirdpart/mapbox/Marker.svelte";
    import {tdtStyle} from "$lib/thirdpart/mapbox/map-styles";
    import BoundaryLayer from "$lib/thirdpart/mapbox/BoundaryLayer.svelte";

    export let data;
    //行政区划geosjon边界数据
    let {areaGeo} = data;

    let map = null;

    let center = { lat: 23.34, lng: 113.56 }
    //天地图图层
    let style = tdtStyle("da289cb6acc5479ea6ab4b225042d8a4");

</script>

<MapBox accessToken="pk.eyJ1Ijoiemh5aTEyIiwiYSI6ImNsNjgyYWNzZDNxaHgzam8xbTJ0b2JtdGUifQ.FOHj9ZueVLkivDvj9fHPZA"
        bind:this={map} {center} {style}
        options={{ scrollZoom: true }}
>
    <Marker lat={center.lat} lng={center.lng} color="rgb(255,255,255)" label="some marker label" popupClassName="class-name" />
    <BoundaryLayer geoJson={areaGeo}/>
    <NavigationControl/>
    <ScaleControl/>
</MapBox>

<div class="right-page">
    <slot>

    </slot>
</div>

<style>
    .right-page{
        width:360px;
    }
</style>