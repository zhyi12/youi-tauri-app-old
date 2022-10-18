<script lang="ts">

    import action from "./action";
    import {classnames} from "../../youi/index";

    let className = '';
    /*  样式 */
    export { className as class };

    export let options =  {};

    $:classes = classnames("youi-echart",className);

</script>

<div class={classes} use:action={{options}}>

</div>