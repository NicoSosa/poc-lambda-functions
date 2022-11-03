const projectResource = require('./project/projectResource');
const projectIdResource = require('./project/projectIdResource');
const taskPackageResource = require('./taskPackage/taskPackageResource');
const taskPackageIdResource = require('./taskPackage/taskPackageIdResource');
const templateResource = require('./template/templateResource');
const templateIdResource = require('./template/templateIdResource');
const workspaceResource = require('./workspace/workspaceResource');
const workspaceIdResource = require('./workspace/workspaceIdResource');

module.exports = {
    projectResource,
    projectIdResource,
    taskPackageResource,
    taskPackageIdResource,
    templateResource,
    templateIdResource,
    workspaceResource,
    workspaceIdResource
}
