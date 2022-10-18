<script lang="ts">

    import {APP_ICONS} from "$lib/app-icon/icons";
    import {Button, Icon} from "$lib/youi";
    import CodeMirror from "$lib/thirdpart/codemirror/CodeMirror.svelte";

    let svgInput = '';
    let svgCode = '';
    let jsCode = '';

    let icons = [];
    for (let name in APP_ICONS) {
        icons.push({
            name,
            data: APP_ICONS[name]
        })
    }

    const toIconJs = () => {
        if(svgCode){
            let parser = new DOMParser();

            const doc = parser.parseFromString(svgCode,"text/xml");
            if(doc){
                let svgRoot  = doc.documentElement;
                if(svgRoot.nodeName === 'svg'){
                    //
                    let viewBox = svgRoot.getAttribute("viewBox");
                    const boxes = viewBox.split(' ');
                    const iconData = {width:parseInt(boxes[2]),height:parseInt(boxes[3]),paths:[]};
                    svgRoot.childNodes.forEach(node=>{
                        if(node.nodeName === 'path'){
                            iconData.paths.push({
                                fill:node.getAttribute('fill')||'',
                                d:node.getAttribute('d'),
                            });
                        }
                    })
                    jsCode = 'export default { \'iconName\':' +JSON.stringify(iconData) +'}'
                }
            }
        }
    }

    const handle_svg_change = ({detail}) => {
        svgCode = detail.value;
    }

</script>
<div class="flex content flex-full">

    <CodeMirror value={svgInput} on:change={handle_svg_change}>

    </CodeMirror>
    <div>
        {jsCode}
    </div>
    <div class="padding">
        <Button on:click={()=>toIconJs()}>
            svg 转 js
        </Button>
    </div>


    <div class="flex-1 flex-full">
        {#each icons as icon}
            <span class="flex-column icon-item">
                <Icon scale="1.5" data={icon.data}></Icon>
                <div>{icon.name}</div>
            </span>
        {/each}
    </div>
</div>
<style lang="scss">

  .icon-item {
    float: left;
    text-align: center;
    width: 50px;
    padding: 6px;
    border-radius: 6px;
    margin: 2px;
    cursor: pointer;
    overflow: hidden;
    &:hover {
      background: #b9c6d2;
    }
  }
</style>

