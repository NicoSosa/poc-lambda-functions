const util = require('./utils/util')

const tasksPackageService = require('./service/tasksPackageService');

const tasksPackagePath = '/task-package';
const tasksPackageIdPath = `${tasksPackagePath}/{id}`;

exports.handler = async (event, context, callback) => {
    let response;
    let id;
    let body; 
    
    console.log('Request Event', event);
    switch (true) {
        // TasksPackageAsync
        case event.httpMethod === 'GET' && event.resource === tasksPackagePath:
            //response = util.buildResponse(200, {message: 'Handle Get All Method'});
            response = await tasksPackageService.getAllTasksPackagesAsync();
            break;
            
        case event.httpMethod === 'POST' && event.resource === tasksPackagePath:
            body = JSON.parse(event.body);
            //response = util.buildResponse(200, {message:'Handle Create Method', body});
            response = await tasksPackageService.createTasksPackageAsync(body);
            break;

        case event.httpMethod === 'GET' && event.resource === tasksPackageIdPath:
            id = event.pathParameters.id;
            //response = util.buildResponse(200, {message:'Handle get Method', id});
            response = await tasksPackageService.getTasksPackageByIdAsync(id);
            break;

        case event.httpMethod === 'PUT' && event.resource === tasksPackageIdPath:
            id = event.pathParameters.id;
            body = JSON.parse(event.body);
            //response = util.buildResponse(200, {message:'Handle udpdate Method', body});
            response = await tasksPackageService.updateTasksPackageAsync(id, body);
            break;
        case event.httpMethod === 'DELETE' && event.resource === tasksPackageIdPath:
            id = event.pathParameters.id;
            //response = util.buildResponse(200, {message:'Handle Delete Method', id});
            response = await tasksPackageService.deleteTasksPackageAsync(id);
            break;
        
        default:
            response = util.buildResponse(404, '404 - Not Found');
    }
    return response;
};
