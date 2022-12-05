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
    
    validated = validateProjectStaff(project)
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
    if (!project.details || !project.details.name || !project.details.projectType || !project.details.initialDate ) return { hasError: true, errorResponse: projectResponse.projectRequestHasNotDetailsResponse }
    return { hasError: false }
}

const validateProjectTasksIncidences = (project) => {
    if (!project.tasksPackages || project.tasksPackages.length < 1) return { hasError: true, errorResponse: projectResponse.projectRequestHasNotTasksResponse }
    return { hasError: false }
}

const validateProjectStaff = (project) => {
    if (!project.staff || project.staff.length < 1) return { hasError: true, errorResponse: projectResponse.projectRequestHasNotUsersResponse }
    return { hasError: false }
}


const validateProjectExist = (project) => {
    if ( !project || !project.details || !project.projectId ) return { hasError: true, errorResponse: projectResponse.projectDoesNotExistResponse}
    return { hasError: false }
}

module.exports = {
    validateNewProjectData,
    validateProjectDetails,
    validateProjectTasksIncidences,
    validateProjectStaff,
    validateProjectExist
}
