const projectResponse = require('../messages/projectResponses')

const validateNewProjectData = (project) => {   
    let validated = validateProject(project)
    if(validated.hasError) return {...validated}
    
    validated = validateProjectWorkspaceId(project)
    if(validated.hasError) return {...validated}
    
    validated = validateProjectDetails(project)
    if(validated.hasError) return {...validated}
    
    validated = validateProjectTasksIncidences(project)
    if(validated.hasError) return {...validated}
    
    validated = validateProjectUsers(project)
    if(validated.hasError) return {...validated}
    
    return { hasError: false }
}


const validateProject = (project) => {
    if (!project) return { hasError: true, errorResponse: projectResponse.projectRequestHasNotWorkspaceIdResponse }
    return { hasError: false }
}

const validateProjectWorkspaceId = (project) => {
    if (!project.workspaceId) return { hasError: true, errorResponse: projectResponse.projectRequestHasNotWorkspaceIdResponse }
    return { hasError: false }
}

const validateProjectDetails = (project) => {
    if (!project.details) return { hasError: true, errorResponse: projectResponse.projectRequestHasNotDetailsResponse }
    return { hasError: false }
}

const validateProjectTasksIncidences = (project) => {
    if (!project.users || project.users.length < 1) return { hasError: true, errorResponse: projectResponse.projectRequestHasNotTasksResponse }
    return { hasError: false }
}

const validateProjectUsers = (project) => {
    if (!project.users || project.users.length < 1) return { hasError: true, errorResponse: projectResponse.projectRequestHasNotUsersResponse }
    return { hasError: false }
}


const validateProjectExist = (project) => {
    if ( !project || !project.data || !project.projectId ) return { hasError: true, errorResponse: projectResponse.projectDoesNotExistResponse}
    return { hasError: false }
}

module.exports = {
    validateNewProjectData,
    validateProjectDetails,
    validateProjectTasksIncidences,
    validateProjectUsers,
    validateProjectExist
}
