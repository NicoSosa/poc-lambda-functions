const util = require('../../utils/util')
const workspaceService = require('../../service/workspaceService');

const resourceMethod = async(event) => { 
    let response;
    let id;
    let body;

    switch (event.httpMethod) {
        case 'GET':
            id = event.pathParameters.id;
            response = await workspaceService.getWorkspaceByIdAsync(id);
            break;

        case 'PUT':
            id = event.pathParameters.id;
            body = JSON.parse(event.body);
            response = await workspaceService.updateWorkspaceAsync(id, body);
            break;

        case 'DELETE':
            id = event.pathParameters.id;
            response = await workspaceService.deleteWorkspaceAsync(id);
            break;

        default:
            response = util.buildResponse(404, '404 - Not Found');
            break;
    }
    return response;
}

module.exports = { resourceMethod };