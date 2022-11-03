const util = require('./utils/util')

const taskPackageResource = require('./resources/taskPackage/taskPackageResource');
const taskPackageIdResource = require('./resources/taskPackage/taskPackageIdResource');
const templateResource = require('./resources/template/templateResource');
const templateIdResource = require('./resources/template/templateIdResource');
const workspaceResource = require('./resources/workspace/workspaceResource');
const workspaceIdResource = require('./resources/workspace/workspaceIdResource');


const tasksPackagePath = '/task-package';
const tasksPackageIdPath = `${tasksPackagePath}/{id}`;
const templatePath = '/template';
const templateIdPath = `${templatePath}/{id}`;
const workspacePath = '/workspace';
const workspaceIdPath = `${workspacePath}/{id}`;


exports.handler = async (event, context, callback) => {
    let response;

    console.log('Request Event', event);
    switch (true) {
        // TASK-PACKAGE
        case event.resource === tasksPackagePath:
            response = await taskPackageResource.resourceMethod(event)
            break;

        case event.resource === tasksPackageIdPath:
            response = await taskPackageIdResource.resourceMethod(event)
            break;

        // TEMPLATE
        case event.resource === templatePath:
            response = await templateResource.resourceMethod(event)
            break;

        case event.resource === templateIdPath:
            response = await templateIdResource.resourceMethod(event)
            break;  
        
        // WORKSPACE
        case event.resource === workspacePath:
            response = await workspaceResource.resourceMethod(event)
            break;

        case event.resource === workspaceIdPath:
            response = await workspaceIdResource.resourceMethod(event)
            break;

        default:
            response = util.buildResponse(404, '404 - Not Found');
    }
    return response;
};
