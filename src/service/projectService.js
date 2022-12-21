const { v4: uuidv4 } = require('uuid');
const { DynamoDBClient, BatchGetItemCommand, BatchWriteItemCommand, ScanCommand, GetItemCommand, PutItemCommand, DeleteItemCommand, QueryCommand } = require("@aws-sdk/client-dynamodb");
const { UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const db = new DynamoDBClient({ region: 'sa-east-1' });

const projectTable = 'ProjectTable';
const userWorkspaceTable = 'UserWorkspaceTable';

const projectValidation = require('../infrastructure/validations/projectValidations');
const projectResponses = require('../infrastructure/messages/projectResponses');
const serverResponses = require('../infrastructure/messages/serverResponses');

const workspaceService = require('./workspaceService');
const userService = require('./userService');

const util = require('../utils/util');


const getAllProjectsAsync = async () => {
    const params = {
        TableName: projectTable,
    };

    try {
        const command = new ScanCommand(params);
        const response = await db.send(command);
        const listResponse = response.Items?.map( item => {
            const commonItem = unmarshall(item)
            return {
                id: commonItem.projectId,
                ...commonItem
            }
        });
        return util.buildResponse(200, listResponse);
        
    } catch (e) {
        return util.buildResponse(500, e);;
    }
};

const getProjectsByWorkspaceIdAsync = async (workspaceId) => {
    const params = {
        TableName: projectTable,
        KeyConditionExpression: "workspaceId = :id",
        ExpressionAttributeValues: {
          ":id": {S: workspaceId},
        },
    };

    try {
        const command = new QueryCommand(params);
        const response = await db.send(command);
        const listResponse = response.Items?.map( item => {
            const commonItem = unmarshall(item)
            return {
                id: commonItem.projectId,
                ...commonItem
            }
        });
        return util.buildResponse(200, listResponse);
        
    } catch (e) {
        return util.buildResponse(500, e);
    }
};

const getProjectByIdAsync = async (projectId) => {
    const { hasError, errorResponse, dbProject } = await getProjectFromDbAsync(projectId);
    
    if (hasError) return errorResponse()

    const projectResponse = {
        id: projectId,
        ...dbProject
    }
    return util.buildResponse(200, projectResponse);
};

const createProjectAsync = async (newProject) => {
    const { hasError, errorResponse } = projectValidation.validateNewProjectData(newProject)
    if (hasError) return errorResponse()
    

    const userValidated = await userService.getUserFromDbAsync(newProject.userId);
    if (userValidated.hasError) return userValidated.errorResponse()
    
    const workspaceValidated = await workspaceService.getWorkspaceFromDbAsync(newProject.workspaceId);
    if (workspaceValidated.hasError) return workspaceValidated.errorResponse()

    const newProjectId = uuidv4();
    
    const logs = [{
            date: Date.now(),
            action: 'Create',
            user: {...userValidated.dbUser}
    }]
    
    const newProjectDto = {
            projectId: newProjectId,
            workspaceId: newProject.workspaceId,
            details: { ...newProject.details },
            staff: [ 
                {
                    userId: userValidated.dbUser.userId,
                    email: userValidated.dbUser.email,
                    name: `${userValidated.dbUser.name} ${userValidated.dbUser.surname}`,
                    role: 0
                },
                ...newProject.staff], 
            // TODO: add newUserStaff
            tasksPackages: [ ...newProject.tasksPackages ],
            status: 0,
            progress: 0, 
            reports: [],
            logs: [...logs]
        }

    try {
        
        const Keys = newProjectDto.staff.map((userProject) => { 
            return marshall({
                userId: userProject.userId,
                workspaceId: newProject.workspaceId

            })
        })
        
        const batchParams = {
            RequestItems: {
                [userWorkspaceTable]: {
                    Keys
                }
            }
        }

        const batchCommand = new BatchGetItemCommand(batchParams);
        const listResponse = await db.send(batchCommand);

        if(!listResponse || !listResponse.Responses || !listResponse.Responses.UserWorkspaceTable) return { hasError: true, errorResponse: serverResponses.serverErrorResponse }

        const userWorkspaceList = listResponse.Responses?.UserWorkspaceTable?.map( item => {
            const commonItem = unmarshall(item)
            return {
                ...commonItem
            }
        });

        const updatedUserWorkspaces = newProjectDto.staff.map((userProject) => {
            let wsUser = userWorkspaceList.find((ws) => ws.userId === userProject.userId)
            if (wsUser) {
                wsUser.projectCount = wsUser.projectCount + 1;
                if (userProject.role == 0) wsUser.projectAsManager.push(newProjectId)
                if (userProject.role == 1) wsUser.projectAsDt.push(newProjectId)
            } else {
                wsUser = {} 
                wsUser.userId = userProject.userId,
                wsUser.workspaceId = newProjectDto.workspaceId,
                wsUser.projectCount = 1
                
                if (userProject.role == 0) {
                    wsUser.projectAsManager = [newProjectId]
                    wsUser.projectAsDt = []
                }
                if (userProject.role == 1) {
                    wsUser.projectAsManager = []
                    wsUser.projectAsDt = [newProjectId]
                }
            }
            return {
             PutRequest: {
                 Item: {
                    ...marshall(wsUser)
                 }
             }   
            }
        })

        const batchCreateParams = {
            RequestItems: {
                [userWorkspaceTable]: [
                    ...updatedUserWorkspaces
                ],
                [projectTable]: [
                    {
                        PutRequest: {
                            Item: {
                            ...marshall(newProjectDto)
                            }
                        }
                    }
                ]
            }
        }

        const command = new BatchWriteItemCommand(batchCreateParams)

        const response = await db.send(command);
        if (!response) return serverResponses.dataBaseErrorResponse()

        // TODO: add project to workspace
        return util.buildResponse(200, {
            message: 'Project created successfully',
            metadata: response,
            project: {
                ...newProjectDto
            }
        });
    } catch (e) {
        return e
    }
};

const updateProjectAsync = async (projectId, projectBody) => {
    const { hasError, errorResponse, dbProject } = await getProjectFromDbAsync(projectId);
    if (hasError) return errorResponse()

    const newProjectData = {
        ...projectBody
    };

    //const updateResponse = await updateProjectOnDbAsync(projectId, newProjectData);

    //if (!updateResponse) return serverResponses.dataBaseErrorResponse()

    // return util.buildResponse(200, {
    //     message: 'Project data updated successfully',
    //     metadata: updateResponse,
    //     updatedData: {...newProjectData}
    // });
    return util.buildResponse(503, {
        message: 'The update method has not implemented in the server',
        noUpdatedData: {...newProjectData}
    });

};

const deleteProjectAsync = async (projectId) => {
    const { hasError, errorResponse, dbProject } = await getProjectFromDbAsync(projectId);
    if (hasError) return errorResponse()
    
    const deleteResponse = await deleteFromDbAsync(projectId);
    return util.buildResponse(200,{
        message: 'Project deleted successfully',
        metadata: deleteResponse
    })

};

const createProjectReportAsync = async (projectId, newProjectReport) => { 
    const { hasError, errorResponse, dbProject } = await getProjectFromDbAsync(projectId);
    if (hasError) return errorResponse()
    
    dbProject.reports.push({...newProjectReport})

    const params = {
        TableName: projectTable,
        Key: { projectId },
        UpdateExpression: "set reports = :r",
        ExpressionAttributeValues: {
            ":r": dbProject.reports,
        }
    } 
    
    try {
        const command = new UpdateCommand(params);
        const response = await db.send(command);
        return util.buildResponse(201, response);
        
        // TODO: create log method
    } catch (e) {
        return { hasError: true, errorResponse: serverResponses.serverErrorResponse };
    }
}

const updateProjectIncidencesAsync = async (projectId, incidencesBody) => { 
    const { hasError, errorResponse, dbProject } = await getProjectFromDbAsync(projectId);
    if (hasError) return errorResponse()
    
    const params = {
        TableName: projectTable,
        Key: { projectId },
        UpdateExpression: "set tasksPackages = :tp, status = :s, progress = :p",
        ExpressionAttributeValues: {
            ":tp": incidencesBody.project.tasksPackages,
            ":s": incidencesBody.project.status,
            ":p": incidencesBody.project.progress
        }
    } 
    
    try {
        const command = new UpdateCommand(params);
        const response = await db.send(command);
        return util.buildResponse(201, response);
        
        // TODO: create log method
    } catch (e) {
        return { hasError: true, errorResponse: serverResponses.serverErrorResponse };
    }
}

// NOT HTTP FUNCTIONS
const getProjectFromDbAsync = async (projectId) => {
    const params = {
        TableName: projectTable,
        Key: marshall({projectId})
    };
    
    
    try {
        const command = new GetItemCommand(params);
        const response = await db.send(command);

        if(!response || !response.Item) return { hasError: true, errorResponse: projectResponses.projectDoesNotExistResponse}

        const dbProject = unmarshall(response.Item);

        const { hasError, errorResponse } = projectValidation.validateProjectExist(dbProject)
        return { hasError, errorResponse, dbProject }

    } catch (e) {
        return { hasError: true, errorResponse: serverResponses.serverErrorResponse };
    }
};

const getProjectListByIdFromDbAsync = async (idsArray) => {
    // TODO Reagroup this method in a new folder called DataAccess    

    const Keys = idsArray.map((projectId) => { 
        return marshall({projectId})
     })
    
    const params = {
        RequestItems: {
            ProjectTable: {
                Keys
            }
        }
    }
    
    try {
        const command = new BatchGetItemCommand(params);
        const response = await db.send(command);

        if(!response || !response.Items) return { hasError: true, errorResponse: serverResponses.serverErrorResponse }

        const projectsList = response.Items?.map( item => {
            const commonItem = unmarshall(item)
            return {
                ...commonItem
            }
        });

        return { hasError: false, projectsList }
    } catch (e) {
        return { hasError: true, errorResponse: serverResponses.serverErrorResponse };
    }
}

const updateProjectOnDbAsync = async (projectId, newProjectData) => {
    const params = {
        TableName: projectTable,
        Key: { 
            workspaceId: '25882541-e857-4b69-8970-a0d61179d74c',
            projectId 
        },
        UpdateExpression: "set variable1 = :x, #MyVariable = :y",
        ExpressionAttributeNames: {
            "#MyVariable": "variable23"
        },
        ExpressionAttributeValues: {
            ":x": "hello2",
            ":y": "dog"
        }
    } 
    
    try {
        const command = new UpdateCommand(params);
        const response = await db.send(command);
        return response
    } catch (e) {
        return e
    }
};

const deleteFromDbAsync = async (projectId) => {
    const params = {
        TableName: projectTable,
        Key: marshall({ projectId })
    };

    try {
        const command = new DeleteItemCommand(params);
        const response = await db.send(command);
        return unmarshall(response);
    } catch (e) {
        return e;
    }
};

module.exports = {
    getAllProjectsAsync,
    getProjectsByWorkspaceIdAsync,
    getProjectByIdAsync,
    createProjectAsync,
    updateProjectAsync,
    deleteProjectAsync,
    createProjectReportAsync,
    updateProjectIncidencesAsync,
    getProjectFromDbAsync,
    getProjectListByIdFromDbAsync
};