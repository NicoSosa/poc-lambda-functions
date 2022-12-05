const { v4: uuidv4 } = require('uuid');
const { DynamoDBClient, ScanCommand, GetItemCommand, PutItemCommand, DeleteItemCommand, QueryCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const db = new DynamoDBClient({ region: 'sa-east-1' });

const workspaceTable = 'WorkspaceTable';
const userWorkspaceTable = 'UserWorkspaceTable';

const workspaceValidations = require('../infrastructure/validations/workspaceValidations');
const workspaceResponses = require('../infrastructure/messages/workspaceResponses');
const serverResponses = require('../infrastructure/messages/serverResponses');

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
                ...commonItem.data
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

const createWorkspaceAsync = async (newWorkspace) => {
    const newId = uuidv4();
    const params = {
        TableName: workspaceTable,
        Item: marshall({
            workspaceId: newId,
            data: {
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

const getWorkspaceByIdAsync = async (workspaceId) => {    
    const { hasError, errorResponse, dbWorkspace} = await getWorkspaceFromDbAsync(workspaceId);

    if (hasError) return errorResponse()

    const workspaceResponse = {
        id: workspaceId,
        ...dbWorkspace.data
    }
    return util.buildResponse(200, workspaceResponse);
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
        Key: marshall({ workspaceId })
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

        const dbWorkpaces = response.Items?.map( item => {
            const commonItem = unmarshall(item)
            return {
                userid: commonItem.userId,
                workspaceId: commonItem.workspaceId,
                ...commonItem
            }
        });
        return { hasError: false, dbWorkpaces };
    } catch (e) {
        return { hasError: true, errorResponse: serverResponses.serverErrorResponse };
    }
};


const updateWorkspaceOnDbAsync = async (workspaceId, newWorkspaceData) => {
    const params = {
        TableName: workspaceTable,
        Item: marshall({
            workspaceId,
            data: {
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