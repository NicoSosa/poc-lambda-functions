const util = require('./utils/util');

const resources = require('./resources/resources');
const paths = require('./paths/paths');

exports.handler = async (event, context, callback) => {
    let response;

    console.log('Request Event', event);
    try {
        switch (true) {
            // PROJECT
            case event.resource === paths.projectPath:
                response = await resources.projectResource.resourceMethod(event)
                break;
    
            case event.resource === paths.projectPathIdPath:
                response = await resources.projectIdResource.resourceMethod(event)
                break;

            // TASK-PACKAGE
            case event.resource === paths.tasksPackagePath:
                response = await resources.taskPackageResource.resourceMethod(event)
                break;
    
            case event.resource === paths.tasksPackageIdPath:
                response = await resources.taskPackageIdResource.resourceMethod(event)
                break;
    
            // TEMPLATE
                case event.resource === paths.templatePath:
                response = await resources.templateResource.resourceMethod(event)
                break;
    
            case event.resource === paths.templateIdPath:
                response = await resources.templateIdResource.resourceMethod(event)
                break;  
            
            // WORKSPACE
            case event.resource === paths.workspacePath:
                response = await resources.workspaceResource.resourceMethod(event)
                break;
    
            case event.resource === paths.workspaceIdPath:
                response = await resources.workspaceIdResource.resourceMethod(event)
                break;
    
            default:
                response = util.buildResponse(404, '404 - Not Found');
        }
    } catch (e) {
        response = util.buildResponse(500, e);
    }
    return response;
};
