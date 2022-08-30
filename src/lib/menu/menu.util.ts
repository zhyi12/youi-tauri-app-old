

/**
 * 从访问路径解析当前模块信息
 * @param url
 * @param params
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const parseActiveModule = (url,params):string => {
    const moduleMatcher:RegExpMatchArray|null = (url.pathname+'/').match(/\/(\w+[-]?\w+)\//);
    let module = '';
    if(moduleMatcher){
        module = moduleMatcher[1];
    }
    return params.module||module;
}