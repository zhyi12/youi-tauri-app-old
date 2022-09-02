<script lang="ts">
    import {setContext} from "svelte";
    import {Toolbar,Icon,Button,Dropdown,DropdownItem,DropdownToggle,DropdownMenu,saveIcon,filterIcon,sortIcon,listIcon,plusIcon} from "$lib/youi";
    import CodeMirror from "$lib/thirdpart/codemirror/CodeMirror.svelte";
    import {codeIcon} from "$lib/app-icon"

    const STEP_ICONS = {
        "reader_csv":listIcon,
        "filter":filterIcon,
        "sort":sortIcon
    };

    const ALL_STEPS = [
        {name:'select',text:'选字段'},
        {name:'filter',text:'过滤'},
        {name:'calculator',text:'计算列'},
        {name:'split',text:'拆分列'},
        {name:'sort',text:'排序'},
        {name:'join',text:'左右连接'},
        {name:'union',text:'上下连接'},
        {name:'agg',text:'分组汇总'},
    ];

    export let data;

    $:baseUri =data.baseUri;
    $:id = data.id;
    $:steps = data.steps;

    let activeStepId = data.steps[0].id;

    let canSave = true;//是否可保存
    let showScript = false;//是否显示脚本

    let queryScript = "";//查询脚本

    setContext("queryStep",{
        showStep:(stepId)=>{
            activeStepId = stepId;
        },
        updateStep:(step)=>{
            console.log('update step')
        }
    });

    const save = () => {
      console.log(queryScript)
    }

</script>

<Toolbar>
    <Button disabled={!canSave} on:click={()=>save()}>
        <Icon data={saveIcon}></Icon>
    </Button>
    <Button class="pull-right" title="查看脚本" active={showScript} on:click={()=>showScript=!showScript}>
        <Icon data={codeIcon}></Icon>
    </Button>
</Toolbar>

<div class="container-auto-height flex-container">
    <div class="page-left">
        {#each steps as step,index}
            <div class={"query-step step-"+step.name} class:active={activeStepId === step.id}>
                <div class="step-header">
                    <div class="step-line"></div>
                    <span class="step-icon">
                        <Icon scale="1.1" data={STEP_ICONS[step.name]||listIcon}></Icon>
                    </span>

                    <Dropdown >
                        <DropdownToggle tag="span" class="hover-item step-btn-add">
                            <Icon scale={index===steps.length-1?1.2:0.9} data={plusIcon}></Icon>
                        </DropdownToggle>
                        <DropdownMenu>
                            {#each ALL_STEPS as stepInfo,infoIndex}
                                <DropdownItem >
                                    <div class="option-item">
                                        <Icon scale="1.1" data={STEP_ICONS[stepInfo.name]||listIcon}></Icon>
                                        <span>{stepInfo.text}</span>
                                    </div>
                                </DropdownItem>
                                {#if infoIndex==4}
                                    <DropdownItem divider />
                                {/if}
                            {/each}
                        </DropdownMenu>
                    </Dropdown>
                </div>
                <div class="step-main flex-1">
                    <div class="step-text flex-1">
                        <a href={step.name!='reader'?(`${baseUri}/${step.id}/${step.name}`):(`${baseUri}`)}>{step.text||step.name}</a>
                    </div>
                </div>
            </div>
        {/each}
    </div>
    <div class="flex-container flex-column">
        {#if showScript}
            <CodeMirror bind:value={queryScript}></CodeMirror>
        {/if}
        <slot>

        </slot>
    </div>
</div>

<style lang="scss">
    .page-left{
      padding: 12px;
      width: 150px;
      .query-step{
        height:80px;
        display: flex;
        &.active{
          .step-text{
            background-color: rgba(232, 240, 255, 1);
            border-color: rgba(107, 164, 245, 1);
            a{
              color:#3685F2;
            }
          }
          .step-icon{
            background:#3685f2;
            color: white;
          }
        }

        .step-header{
          width:32px;
          position: relative;
        }

        .step-main{
          margin-left: -16px;
        }

        .step-line{
          width: 2px;
          top: 0;
          bottom: 0;
          left: 15px;
          position: absolute;
          background-color:#e1e2ef;
        }

        .step-icon{
          display: inline-block;
          width:32px;
          height: 32px;
          text-align: center;
          font-size: 1.1rem;
          background: #e8f0ff;
          border-radius: 16px;
          cursor: pointer;
          position: relative;
          vertical-align: middle;
        }

        .step-text{
          padding-left: 20px;
          flex: 1;
          border: 1px solid rgba(232, 240, 255, 1);
          background-color: rgba(232, 240, 255, 0.305882352941176);

          line-height: 30px;
          vertical-align: middle;
          border-radius: 2px;
          cursor: pointer;

          a{
            display: inline-block;
            width: 100%;
            text-decoration: none;
            color: black;
          }
        }

        .step-text:hover{
          background: #e1e2ef;
        }
      }
    }
</style>
