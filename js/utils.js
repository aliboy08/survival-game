export function get_arr_item_class(arr, constructor_name) {
	for (const i of arr) {
		if (i.constructor.name === constructor_name) {
			return i;
		}
	}
	return null;
}
