const util = require('../../utils/util')
const tasksPackageService = require('../../service/tasksPackageService');

const resourceMethod = async(event) => { 
    let response;
    let id;
    let body;

    switch (event.httpMethod) {
        case 'GET':
            id = event.pathParameters.id;
            response = await tasksPackageService.getTasksPackageByIdAsync(id);
            break;

        case 'PUT':
            id = event.pathParameters.id;
            body = JSON.parse(event.body);
            response = await tasksPackageService.updateTasksPackageAsync(id, body);
            break;

        case 'DELETE':
            id = event.pathParameters.id;
            response = await tasksPackageService.deleteTasksPackageAsync(id);
            break;

        default:
            response = util.buildResponse(404, '404 - Not Found');
            break;
    }
    return response;
}

module.exports = { resourceMethod };