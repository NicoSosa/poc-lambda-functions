const util = require('../../utils/util')
const projectService = require('../../service/projectService');

const resourceMethod = async(event) => { 
    let response;
    let body;

    switch (event.httpMethod) {
        case 'GET':
            response = await projectService.getAllProjectsAsync();
            break;

        case 'POST':
            body = JSON.parse(event.body);
            response = await projectService.createProjectAsync(body);
            break;

        default:
            response = util.buildResponse(404, '404 - Not Found');
            break;
    }
    return response;
}

module.exports = { resourceMethod };