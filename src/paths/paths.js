const projectPath = '/project';
const projectPathIdPath = `${projectPath}/{id}`;
const projectByWorkspaceIdPath = `${projectPath}/workspace/{id}`;
const projectDetailsPath = `${projectPathIdPath}/details`;
const projectIncidencesPath = `${projectPathIdPath}/incidences`;
const projectReportsPath = `${projectPathIdPath}/reports`;

const tasksPackagePath = '/task-package';
const tasksPackageIdPath = `${tasksPackagePath}/{id}`;

const templatePath = '/template';
const templateIdPath = `${templatePath}/{id}`;

const workspacePath = '/workspace';;
const workspaceIdPath = `${workspacePath}/{id}`;
const workspaceUserIdPath = `${workspacePath}/user/{id}`;

module.exports = {
    projectPath,
    projectPathIdPath,
    projectByWorkspaceIdPath,
    projectDetailsPath,
    projectIncidencesPath,
    projectReportsPath,
    tasksPackagePath,
    tasksPackageIdPath,
    templatePath,
    templateIdPath,
    workspacePath,
    workspaceIdPath,
    workspaceUserIdPath
}