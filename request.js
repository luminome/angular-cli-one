const fetch = (url) => import('node-fetch').then(({default: fetch}) => fetch(url));

function byteLength(str) {
	// returns the byte length of an utf8 string
	var s = str.length;
	for (var i=str.length-1; i>=0; i--) {
		var code = str.charCodeAt(i);
		if (code > 0x7f && code <= 0x7ff) s++;
		else if (code > 0x7ff && code <= 0xffff) s+=2;
		if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
	}
	return s;
}

async function loader(resource_obj_list) {
	let container = [];

	resource_obj_list.forEach(obj => {
		let ref = fetch(obj.url)
		.then(response => {
			return response.text()
		})
		.then(function (text) {
			//return (text); //JSON.parse
			obj.size = byteLength(text);
			return obj.type === 'json' ? JSON.parse(text) : text;
		})
		.catch((error) => {
			console.log(error.status, error);
			return error;
		})
		container.push(ref);
	});

	const done = await Promise.all(container);
	resource_obj_list.forEach((obj,i) => {
		obj.raw = done[i]
		obj.time = new Date() - obj.time;
	});
	return resource_obj_list;
}

module.exports = loader;
