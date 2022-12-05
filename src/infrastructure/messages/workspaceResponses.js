const util = require('../../utils/util');

const userHasNotWorkspaces = () => util.buildResponse(400, { message: 'User does not exists or has not workspaces' });
const workspaceDoesNotExistResponse = () => util.buildResponse(400, { message: 'Workspace does not exists' });

module.exports = {
    userHasNotWorkspaces,
    workspaceDoesNotExistResponse
}
