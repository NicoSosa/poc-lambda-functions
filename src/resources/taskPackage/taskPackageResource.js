const util = require('../../utils/util')
const tasksPackageService = require('../../service/tasksPackageService');

const resourceMethod = async(event) => { 
    let response;
    let body;

    switch (event.httpMethod) {
        case 'GET':
            response = await tasksPackageService.getAllTasksPackagesAsync();
            break;

        case 'POST':
            body = JSON.parse(event.body);
            response = await tasksPackageService.createTasksPackageAsync(body);
            break;

        default:
            response = util.buildResponse(404, '404 - Not Found');
            break;
    }
    return response;

}

module.exports = { resourceMethod };