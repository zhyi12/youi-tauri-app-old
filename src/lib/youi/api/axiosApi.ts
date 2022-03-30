import axios from 'axios';

export async function apiGet(url){
	const result =  await axios({
		url:url,
		method:'get'
	});
	return result;
}

export async function apiPost(url,data){
	const result =  await axios({
		url:url,
		method:'post',
		data:data
	});
	return result.data;
}