exports.install = function() {
	ROUTE('GET /', view_home);
}



function view_home($) {

	$.view('index');
};












