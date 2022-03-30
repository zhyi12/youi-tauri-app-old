import { is_function } from 'svelte/internal';
import { writable } from 'svelte/store';

/**
 * 系统确认框
 */
export const confirmStore = buildConfirmStore();

/**
 * 确认框store
 */
function buildConfirmStore(){
	const store = writable({isOpen:false,message:'',confirm:null});

	function doConfirm(message,callback,title?){
		store.update(t=>{
			Object.assign(t,{
				isOpen:true,
				message:message,
				title:title,
				confirm:callback,
				type:'confirm'
			})
			return t;
		})
	}

	function showAlert(message,title){
		store.update(t=>{
			Object.assign(t,{
				isOpen:true,
				message:message,
				title:title||'消息提示',
				type:'alert'
			})
			return t;
		})
	}

	return {doConfirm,showAlert,...store};
}

export function confirm(message,callback){
	if(is_function(callback)){
		confirmStore.doConfirm(message,callback);
	}
	return false;
}

export function alert(message,title){
	confirmStore.showAlert(message,title);
}