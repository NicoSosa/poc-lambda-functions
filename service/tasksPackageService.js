const { DynamoDBClient, ScanCommand, GetItemCommand, PutItemCommand, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall, convertList } = require("@aws-sdk/util-dynamodb");
const db = new DynamoDBClient({ region: 'sa-east-1' });

const util = require('../utils/util');

const tasksPackageTable = 'TasksPackagesTable';


const getAllTasksPackagesAsync = async () => {
    const params = {
        TableName: tasksPackageTable,
    };

    try {
        const command = new ScanCommand(params);
        const response = await db.send(command);
        const listResponse = response.Items?.map( item => {
            const commonItem = unmarshall(item)
            return {
                id: commonItem.tasksPackageId,
                ...commonItem.data
            }
        });
        return util.buildResponse(200, listResponse);
        
    } catch (e) {
        return util.buildResponse(500, e);;
    }
};

const createTasksPackageAsync = async (newTasksPackage) => {
    const newId = 'asdzxc123'
    const params = {
        TableName: tasksPackageTable,
        Item: marshall({
            tasksPackageId: newId,
            data: {
                ...newTasksPackage
            }
        }),
    } 
    
    try {
        const command = new PutItemCommand(params);
        const response = await db.send(command);
        if (!response) return serverErrorResponse

        return util.buildResponse(200, {
            message: 'Tasks Package crated successfully',
            metadata: response,
            taskPackage: {
                id: newId,
                ...newTasksPackage
            }
        });
    } catch (e) {
        return e
    }
};

const getTasksPackageByIdAsync = async (tasksPackageId) => {
    const dbTasksPackage = await getTasksPackageFromDbAsync(tasksPackageId);
    if ( !validateTaskPackageExist(dbTasksPackage) ) return tasksPackageDoesNotExistResponse()

    const tasksPackageResponse = {
        id: tasksPackageId,
        ...dbTasksPackage.data
    }
    return util.buildResponse(200, tasksPackageResponse);

};

const updateTasksPackageAsync = async (tasksPackageId, tasksPackageBody) => {
    const dbTasksPackage = await getTasksPackageFromDbAsync(tasksPackageId);
    if ( !validateTaskPackageExist(dbTasksPackage) ) return tasksPackageDoesNotExistResponse()

    const newTaskPackageData = {
        ...tasksPackageBody
    };

    const updateResponse = await updateTasksPackagOnDbeAsync(tasksPackageId, newTaskPackageData);

    if (!updateResponse) return serverErrorResponse

    return util.buildResponse(200, {
        message: 'Tasks Package data updated successfully',
        metadata: updateResponse,
        newTaskPackageData
    });

};

const deleteTasksPackageAsync = async (tasksPackageId) => {
    const dbTasksPackage = await getTasksPackageFromDbAsync(tasksPackageId);
    if ( !validateTaskPackageExist(dbTasksPackage) ) return tasksPackageDoesNotExistResponse()
    
    const deleteResponse = await deleteFromDbAsync(tasksPackageId);
    return util.buildResponse(200,{
        message: 'Tasks Package deleted successfully',
        metadata: deleteResponse
    })

};

// NOT EXPORTED FUNCTIONS
const getTasksPackageFromDbAsync = async (tasksPackageId) => {
    const params = {
        TableName: tasksPackageTable,
        Key: marshall({ tasksPackageId })
    };

    try {
        const command = new GetItemCommand(params);
        const response = await db.send(command);
        return unmarshall(response.Item);
    } catch (e) {
        return e;
    }
};

const updateTasksPackagOnDbeAsync = async (tasksPackageId, newTaskPackageData) => {
    const params = {
        TableName: tasksPackageTable,
        Item: marshall({
            tasksPackageId,
            data: {
                ...newTaskPackageData
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

const deleteFromDbAsync = async (tasksPackageId) => {
    const params = {
        TableName: tasksPackageTable,
        Key: marshall({ tasksPackageId })
    };

    try {
        const command = new DeleteItemCommand(params);
        const response = await db.send(command);
        return unmarshall(response);
    } catch (e) {
        return e;
    }
};

const validateTaskPackageExist = (tasksPackage) => {
    if ( !tasksPackage || !tasksPackage.data || !tasksPackage.tasksPackageId ) return false
    return true
};

const tasksPackageDoesNotExistResponse = () => util.buildResponse(400, { message: 'Tasks Package does not exists' });
const serverErrorResponse = () => util.buildResponse(503, { message: 'Server Error. Please try again later.'});

module.exports = {
    getAllTasksPackagesAsync,
    createTasksPackageAsync,
    getTasksPackageByIdAsync,
    updateTasksPackageAsync,
    deleteTasksPackageAsync
};