const util = require('../../utils/util')
const projectService = require('../../service/projectService');

const resourceMethod = async(event) => { 
    let response;
    let id;
    let body;

    switch (event.httpMethod) {
        case 'GET':
            id = event.pathParameters.id;
            response = await projectService.getProjectByIdAsync(id);
            break;

        case 'PUT':
            id = event.pathParameters.id;
            body = JSON.parse(event.body);
            response = await projectService.updateProjectAsync(id, body);
            break;

        case 'DELETE':
            id = event.pathParameters.id;
            response = await projectService.deleteProjectAsync(id);
            break;

        default:
            response = util.buildResponse(404, '404 - Not Found');
            break;
    }
    return response;
}

module.exports = { resourceMethod };