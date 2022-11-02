const util = require('./utils/util')

const taskPackageResource = require('./resources/taskPackage/taskPackageResource');
const taskPackageIdResource = require('./resources/taskPackage/taskPackageIdResource');
const templateResource = require('./resources/template/templateResource');
const templateIdResource = require('./resources/template/templateIdResource');

const tasksPackagePath = '/task-package';
const tasksPackageIdPath = `${tasksPackagePath}/{id}`;
const templatePath = '/template';
const templateIdPath = `${templatePath}/{id}`;


exports.handler = async (event, context, callback) => {
    let response;

    console.log('Request Event', event);
    switch (true) {
        case event.resource === tasksPackagePath:
            response = await taskPackageResource.resourceMethod(event)
            break;

        case event.resource === tasksPackageIdPath:
            response = await taskPackageIdResource.resourceMethod(event)
            break;

        case event.resource === templatePath:
            response = await templateResource.resourceMethod(event)
            break;

        case event.resource === templateIdPath:
            response = await templateIdResource.resourceMethod(event)
            break;
        
        default:
            response = util.buildResponse(404, '404 - Not Found');
    }
    return response;
};
