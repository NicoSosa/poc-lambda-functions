const workspaceResponses = require('../messages/workspaceResponses')

const validateWorkspaceExist = (workspace) => {
    if ( !workspace || !workspace.data || !workspace.workspaceId ) return { hasError: true, errorResponse: workspaceResponses.workspaceDoesNotExistResponse }
    return { hasError: false }
}

module.exports = {
    validateWorkspaceExist
}
