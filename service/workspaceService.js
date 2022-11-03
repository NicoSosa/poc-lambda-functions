const { v4: uuidv4 } = require('uuid');
const { DynamoDBClient, ScanCommand, GetItemCommand, PutItemCommand, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const db = new DynamoDBClient({ region: 'sa-east-1' });

const util = require('../utils/util');

const workspaceTable = 'WorkspaceTable';


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
        if (!response) return serverErrorResponse

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
    const dbWorkspace = await getWorkspaceFromDbAsync(workspaceId);
    if ( !validateWorkspaceExist(dbWorkspace) ) return workspaceDoesNotExistResponse()

    const workspaceResponse = {
        id: workspaceId,
        ...dbWorkspace.data
    }
    return util.buildResponse(200, workspaceResponse);
};

const updateWorkspaceAsync = async (workspaceId, workspaceBody) => {
    const dbWorkspace = await getWorkspaceFromDbAsync(workspaceId);
    if ( !validateWorkspaceExist(dbWorkspace) ) return workspaceDoesNotExistResponse()

    const newWorkspaceData = {
        ...workspaceBody
    };

    const updateResponse = await updateWorkspaceOnDbAsync(workspaceId, newWorkspaceData);

    if (!updateResponse) return serverErrorResponse()

    return util.buildResponse(200, {
        message: 'Workspace data updated successfully',
        metadata: updateResponse,
        updatedData: {...newWorkspaceData}
    });

};

const deleteWorkspaceAsync = async (workspaceId) => {
    const dbWorkspace = await getWorkspaceFromDbAsync(workspaceId);
    if ( !validateWorkspaceExist(dbWorkspace) ) return workspaceDoesNotExistResponse()
    
    const deleteResponse = await deleteFromDbAsync(workspaceId);
    return util.buildResponse(200,{
        message: 'Workspace deleted successfully',
        metadata: deleteResponse
    })

};

// NOT EXPORTED FUNCTIONS
const getWorkspaceFromDbAsync = async (workspaceId) => {
    const params = {
        TableName: workspaceTable,
        Key: marshall({ workspaceId })
    };

    try {
        const command = new GetItemCommand(params);
        const response = await db.send(command);
        return unmarshall(response.Item);
    } catch (e) {
        return e;
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

const validateWorkspaceExist = (workspace) => {
    if ( !workspace || !workspace.data || !workspace.workspaceId ) return false
    return true
};

const workspaceDoesNotExistResponse = () => util.buildResponse(400, { message: 'Workspace does not exists' });
const serverErrorResponse = () => util.buildResponse(503, { message: 'Server Error. Please try again later.'});

module.exports = {
    getAllWorkspacesAsync,
    createWorkspaceAsync,
    getWorkspaceByIdAsync,
    updateWorkspaceAsync,
    deleteWorkspaceAsync
};