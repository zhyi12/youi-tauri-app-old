

/**
 *
 * @param name
 */
export const parseFileExtension = (name:string):string => {
    const ext = name.split('.').pop()||'';
    return ext.toLowerCase();
}
/**
 *
 * @param path
 */
export const parseFolder = (path:string):string => {
    const parts = path.split('/');
    parts.pop();
    return parts.join('/');
}

/**
 *
 * @param name
 */
export const trimFileExtension = (name:string) => {
    const ext = parseFileExtension(name);
    return name.substring(0,name.length - ext.length-1);
}

