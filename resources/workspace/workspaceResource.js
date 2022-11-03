const util = require('../../utils/util')
const workspaceService = require('../../service/workspaceService');

const resourceMethod = async(event) => { 
    let response;
    let body;

    switch (event.httpMethod) {
        case 'GET':
            response = await workspaceService.getAllWorkspacesAsync();
            break;

        case 'POST':
            body = JSON.parse(event.body);
            response = await workspaceService.createWorkspaceAsync(body);
            break;

        default:
            response = util.buildResponse(404, '404 - Not Found');
            break;
    }
    return response;
}

module.exports = { resourceMethod };