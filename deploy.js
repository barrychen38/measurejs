const ghpages = require('gh-pages');

ghpages.publish('gh-pages', {
	push: true,
	message: "update gh-pages"
}, (err) => {
	if (err) {
		console.error(err);
		return;
	}
	console.log('Published.');
});
