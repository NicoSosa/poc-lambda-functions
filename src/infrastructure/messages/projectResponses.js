const util = require('../../utils/util');

const projectRequestMustBeNotNullResponse = () => util.buildResponse(400, { message: 'The Project in the Request must be not null or undefined' });
const projectRequestHasNotUserIdResponse = () => util.buildResponse(400, { message: 'The Project in the Request has not userId' });
const projectRequestHasNotWorkspaceIdResponse = () => util.buildResponse(400, { message: 'The Project in the Request has not workspaceId' });
const projectRequestHasNotDetailsResponse = () => util.buildResponse(400, { message: 'The Project in the Request has not details or the details are incomplete' });
const projectRequestHasNotTasksResponse = () => util.buildResponse(400, { message: 'The Project in the Request has not tasks' });
const projectRequestHasNotUsersResponse = () => util.buildResponse(400, { message: 'The Project in the Request has not users' });
const projectDoesNotExistResponse = () => util.buildResponse(400, { message: 'Project does not exists' });
const reportHasNotNovelties = () => util.buildResponse(400, { message: 'The report in the Request has not novelties'});

module.exports = {
    projectRequestMustBeNotNullResponse,
    projectRequestHasNotUserIdResponse,
    projectRequestHasNotWorkspaceIdResponse,
    projectRequestHasNotDetailsResponse,
    projectRequestHasNotTasksResponse,
    projectRequestHasNotUsersResponse,
    reportHasNotNovelties,
    projectDoesNotExistResponse
}
