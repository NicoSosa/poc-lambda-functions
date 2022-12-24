const { v4: uuidv4 } = require('uuid');
const { DynamoDBClient, BatchGetItemCommand, ScanCommand, GetItemCommand, PutItemCommand, DeleteItemCommand, QueryCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const db = new DynamoDBClient({ region: 'sa-east-1' });

const workspaceTable = 'WorkspaceTable';
const userWorkspaceTable = 'UserWorkspaceTable';

const workspaceValidations = require('../infrastructure/validations/workspaceValidations');
const workspaceResponses = require('../infrastructure/messages/workspaceResponses');
const serverResponses = require('../infrastructure/messages/serverResponses');

const projectService = require('./projectService');

const util = require('../utils/util');


const getAllWorkspacesAsync = async () => {
    const params = {
        TableName: workspaceTable,
    };

    try {
        const command = new ScanCommand(params);
        const response = await db.send(command);
        const listResponse = response.Items?.map( item => {
            const commonItem = unmarshall(item)
            return {
                id: commonItem.workspaceId,
                ...commonItem
            }
        });
        return util.buildResponse(200, listResponse);
        
    } catch (e) {
        return util.buildResponse(500, e);;
    }
};

const getWorkspaceByUserId = async (userId) => {
    const { hasError, errorResponse, dbWorkpaces } = await getWorkspaceFromDbByUserIdAsync(userId);

    if (hasError) return errorResponse()

    return util.buildResponse(200, dbWorkpaces)
}

const getWorkspaceByIdAsync = async (workspaceId) => {    
    const { hasError, errorResponse, dbWorkspace} = await getWorkspaceFromDbAsync(workspaceId);

    if (hasError) return errorResponse()

    const workspaceResponse = {
        id: workspaceId,
        ...dbWorkspace
    }
    return util.buildResponse(200, workspaceResponse);
};


const createWorkspaceAsync = async (newWorkspace) => {
    const newId = uuidv4();
    const params = {
        TableName: workspaceTable,
        Item: marshall({
            workspaceId: newId,
            details: {
                ...newWorkspace
            }
        }),
    } 
    
    try {
        const command = new PutItemCommand(params);
        const response = await db.send(command);
        if (!response) return serverResponses.dataBaseErrorResponse()

        return util.buildResponse(200, {
            message: 'Workspace created successfully',
            metadata: response,
            workspace: {
                id: newId,
                ...newWorkspace
            }
        });
    } catch (e) {
        return e
    }
};

const updateWorkspaceAsync = async (workspaceId, workspaceBody) => {
    const { hasError, errorResponse, dbWorkspace} = await getWorkspaceFromDbAsync(workspaceId);
    
    if (hasError) return errorResponse()

    const newWorkspaceData = {
        ...workspaceBody
    };

    const updateResponse = await updateWorkspaceOnDbAsync(workspaceId, newWorkspaceData);

    if (!updateResponse) return serverResponses.dataBaseErrorResponse()

    return util.buildResponse(200, {
        message: 'Workspace data updated successfully',
        metadata: updateResponse,
        updatedData: {...newWorkspaceData}
    });

};

const deleteWorkspaceAsync = async (workspaceId) => {
    const { hasError, errorResponse, dbWorkspace} = await getWorkspaceFromDbAsync(workspaceId);
    
    if (hasError) return errorResponse()
    
    const deleteResponse = await deleteFromDbAsync(workspaceId);
    return util.buildResponse(200,{
        message: 'Workspace deleted successfully',
        metadata: deleteResponse
    })

};

// NOT HTTP FUNCTIONS
const getWorkspaceFromDbAsync = async (workspaceId) => {
    const params = {
        TableName: workspaceTable,
        Key: marshall({ workspaceId }),
        ProjectionExpression: 'details, workspaceId'
    };

    try {
        const command = new GetItemCommand(params);
        const response = await db.send(command);
        
        if(!response || !response.Item) return { hasError: true, errorResponse: workspaceResponses.workspaceDoesNotExistResponse}

        const dbWorkspace = unmarshall(response.Item);

        const validateObj = workspaceValidations.validateWorkspaceExist(dbWorkspace)
        return { ...validateObj, dbWorkspace }

    } catch (e) {
        return { hasError: true, errorResponse: serverResponses.serverErrorResponse };
    }
};

const getWorkspaceFromDbByUserIdAsync = async (userId) => {
    const params = {
        TableName: userWorkspaceTable,
        KeyConditionExpression: "userId = :id",
        ExpressionAttributeValues: {
          ":id": {S: userId},
        },
    };

    try {
        const command = new QueryCommand(params);
        const response = await db.send(command);

        if(!response || !response.Items) return { hasError: true, errorResponse: workspaceResponses.userHasNotWorkspaces}

        let projectsArrayAux = []

        const workpacesDescript = await Promise.all(response.Items?.map(async (item) => {
            const commonItem = unmarshall(item)
            const { dbWorkspace } = await getWorkspaceFromDbAsync(commonItem.workspaceId);
            
            if (commonItem.projectAsManager.length > 0) {
                projectsArrayAux.push(...commonItem.projectAsManager)
            }
            
            if (commonItem.projectAsDt.length > 0) {
                projectsArrayAux.push(...commonItem.projectAsDt)
            }
            
            return {
                workspaceId: commonItem.workspaceId,
                projectAsManager: commonItem.projectAsManager,
                projectAsDt: commonItem.projectAsDt,
                ...dbWorkspace.details
            }
        }));
        
        const Keys = projectsArrayAux.map((projectId) => { 
            return marshall({projectId})
        })
    
        const batchParams = {
            RequestItems: {
                ProjectTable: {
                    Keys
                }
            }
        }
        
        const batchCommand = new BatchGetItemCommand(batchParams);
        const listResponse = await db.send(batchCommand);

        if(!listResponse || !listResponse.Responses || !listResponse.Responses.ProjectTable) return { hasError: true, errorResponse: serverResponses.serverErrorResponse }

        const projectsList = listResponse.Responses?.ProjectTable?.map( item => {
            const commonItem = unmarshall(item)
            return {
                ...commonItem
            }
        });
        
            const dbWorkpaces = workpacesDescript.map( ws => {
                ws.projects = []
            if (ws.projectAsManager.length > 0) {
                let arrayAux = []
                ws.projectAsManager.forEach( id => {
                    let proj = projectsList.filter( project => project.projectId === id)
                    if (proj) arrayAux.push({...proj[0], role: 'manager'})
                })
                ws.projects = [...arrayAux]
            }
            
            if (ws.projectAsDt.length > 0) {
                let arrayAux = []
                ws.projectAsDt.forEach( id => {
                    let proj = projectsList.filter( project => project.projectId === id)
                    if (proj) arrayAux.push({...proj[0], role: 'dt'})
                })
                ws.projects = [... ws.projects, ...arrayAux]
            }
            return ws
        })
        
        
        return { hasError: false, dbWorkpaces };
        //return { hasError: false, dbWorkpaces: { projectsList } };
    } catch (e) {
        return { hasError: true, errorResponse: serverResponses.serverErrorResponse };
    }
};


const updateWorkspaceOnDbAsync = async (workspaceId, newWorkspaceData) => {
    const params = {
        TableName: workspaceTable,
        Item: marshall({
            workspaceId,
            details: {
                ...newWorkspaceData
            }
        }),
    } 
    
    try {
        const command = new PutItemCommand(params);
        const response = await db.send(command);
        return response
    } catch (e) {
        return e
    }
};

const deleteFromDbAsync = async (workspaceId) => {
    const params = {
        TableName: workspaceTable,
        Key: marshall({ workspaceId })
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
    getAllWorkspacesAsync,
    getWorkspaceByUserId,
    createWorkspaceAsync,
    getWorkspaceByIdAsync,
    updateWorkspaceAsync,
    deleteWorkspaceAsync,
    getWorkspaceFromDbAsync
};