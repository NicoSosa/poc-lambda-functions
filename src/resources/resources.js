const projectResource = require('./project/projectResource');
const projectIdResource = require('./project/projectIdResource');
const projectByWorkspaceIdResource = require('./project/projectByWorkspaceIdResource');
const taskPackageResource = require('./taskPackage/taskPackageResource');
const taskPackageIdResource = require('./taskPackage/taskPackageIdResource');
const templateResource = require('./template/templateResource');
const templateIdResource = require('./template/templateIdResource');
const workspaceResource = require('./workspace/workspaceResource');
const workspaceIdResource = require('./workspace/workspaceIdResource');
const workspaceUserIdResource = require('./workspace/workspaceUserIdResource');

module.exports = {
    projectResource,
    projectIdResource,
    projectByWorkspaceIdResource,
    taskPackageResource,
    taskPackageIdResource,
    templateResource,
    templateIdResource,
    workspaceResource,
    workspaceIdResource,
    workspaceUserIdResource
}
