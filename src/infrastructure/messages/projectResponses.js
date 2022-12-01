const util = require('../../utils/util');

const projectRequestMustBeNotNullResponse = () => util.buildResponse(400, { message: 'The Project in the Request must be not null or undefined' });
const projectRequestHasNotWorkspaceIdResponse = () => util.buildResponse(400, { message: 'The Project in the Request has not workspaceId' });
const projectRequestHasNotDetailsResponse = () => util.buildResponse(400, { message: 'The Project in the Request has not details' });
const projectRequestHasNotTasksResponse = () => util.buildResponse(400, { message: 'The Project in the Request has not tasks' });
const projectRequestHasNotUsersResponse = () => util.buildResponse(400, { message: 'The Project in the Request has not users' });
const projectDoesNotExistResponse = () => util.buildResponse(400, { message: 'Project does not exists' });

module.exports = {
    projectRequestMustBeNotNullResponse,
    projectRequestHasNotWorkspaceIdResponse,
    projectRequestHasNotDetailsResponse,
    projectRequestHasNotTasksResponse,
    projectRequestHasNotUsersResponse,
    projectDoesNotExistResponse
}
