const { v4: uuidv4 } = require('uuid');
const { DynamoDBClient, ScanCommand, GetItemCommand, PutItemCommand, DeleteItemCommand, QueryCommand } = require("@aws-sdk/client-dynamodb");
const { UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const db = new DynamoDBClient({ region: 'sa-east-1' });

const projectTable = 'ProjectTable';

const projectValidation = require('../infrastructure/validations/projectValidations');
const projectResponses = require('../infrastructure/messages/projectResponses');
const serverResponses = require('../infrastructure/messages/serverResponses');

const workspaceService = require('./workspaceService');

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
                ...commonItem.data
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
                ...commonItem.data
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
        ...dbProject.data
    }
    return util.buildResponse(200, projectResponse);
};

const createProjectAsync = async (newProject) => {
    const { hasError, errorResponse } = projectValidation.validateNewProjectData(newProject)
    if (hasError) return errorResponse()

    
    const workspaceValidated = await workspaceService.getWorkspaceFromDbAsync(newProject.workspaceId);
    if (workspaceValidated.hasError) return workspaceValidated.errorResponse()

    const newId = uuidv4();
    const params = {
        TableName: projectTable,
        Item: marshall({
            projectId: newId,
            workspaceId: newProject.workspaceId,
            data: {
                ...newProject
            }
        }),
    } 
    
    try {
        const command = new PutItemCommand(params);
        const response = await db.send(command);
        if (!response) return serverResponses.dataBaseErrorResponse()

        // TODO: add project to workspace

        return util.buildResponse(200, {
            message: 'Project created successfully',
            metadata: response,
            project: {
                id: newId,
                ...newProject
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

    const updateResponse = await updateProjectOnDbAsync(projectId, newProjectData);

    if (!updateResponse) return serverResponses.dataBaseErrorResponse()

    return util.buildResponse(200, {
        message: 'Project data updated successfully',
        metadata: updateResponse,
        updatedData: {...newProjectData}
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

// NOT HTTP FUNCTIONS
const getProjectFromDbAsync = async (projectId) => {
    const params = {
        TableName: projectTable,
        Key: marshall({ 
            workspaceId: '25882541-e857-4b69-8970-a0d61179d74c',
            projectId 
        })
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
    deleteProjectAsync
};