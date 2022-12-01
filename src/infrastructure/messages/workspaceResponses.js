const util = require('../../utils/util');

const workspaceDoesNotExistResponse = () => util.buildResponse(400, { message: 'Workspace does not exists' });

module.exports = {
    workspaceDoesNotExistResponse
}
