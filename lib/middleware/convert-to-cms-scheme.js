'use strict';

module.exports = convertToCmsScheme;

function convertToCmsScheme() {
	const cmsRegExp = /^https?:\/\/(?:com\.ft\.imagepublish\.prod(-us)?\.s3\.amazonaws\.com|im\.ft-static\.com\/content\/images)\/([0-9a-f-]+)(?:\.img)?$/i;
	return (request, response, next) => {
		const match = request.params[0].match(cmsRegExp);
		if (match && match[2]) {
			request.params[0] = `ftcms:${match[2]}`;
		}
		next();
	};
}