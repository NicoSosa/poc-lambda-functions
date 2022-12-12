const util = require('../../utils/util')
const projectService = require('../../service/projectService');

const resourceMethod = async(event) => { 
    let response;
    let id;
    let body;

    switch (event.httpMethod) {
        case 'POST':
            id = event.pathParameters.id;
            body = JSON.parse(event.body);
            response = await projectService.createProjectReportAsync(id, body);
            break;

        default:
            response = util.buildResponse(404, '404 - Not Found');
            break;
    }
    return response;
}

module.exports = { resourceMethod };