const util = require('../../utils/util')
const projectService = require('../../service/projectService');

const resourceMethod = async(event) => { 
    let response;
    let id;

    switch (event.httpMethod) {
        case 'GET':
            id = event.pathParameters.id;
            response = await projectService.getProjectsByWorkspaceIdAsync(id);
            break;

        default:
            response = util.buildResponse(404, '404 - Not Found');
            break;
    }
    return response;
}

module.exports = { resourceMethod };