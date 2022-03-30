
export function is_tauri_app(){
    return window && window['__TAURI_IPC__'];
}