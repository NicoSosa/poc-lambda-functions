const { v4: uuidv4 } = require('uuid');
const { DynamoDBClient, ScanCommand, GetItemCommand, PutItemCommand, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const db = new DynamoDBClient({ region: 'sa-east-1' });

const util = require('../utils/util');

const projectTable = 'ProjectTable';


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

const createProjectAsync = async (newProject) => {
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
        if (!response) return serverErrorResponse

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

const getProjectByIdAsync = async (projectId) => {
    const dbProject = await getProjectFromDbAsync(projectId);
    if ( !validateProjectExist(dbProject) ) return projectDoesNotExistResponse()

    const projectResponse = {
        id: projectId,
        ...dbProject.data
    }
    return util.buildResponse(200, projectResponse);

};

const updateProjectAsync = async (projectId, projectBody) => {
    const dbProject = await getProjectFromDbAsync(projectId);
    if ( !validateProjectExist(dbProject) ) return projectDoesNotExistResponse()

    const newProjectData = {
        ...projectBody
    };

    const updateResponse = await updateProjectOnDbAsync(projectId, newProjectData);

    if (!updateResponse) return serverErrorResponse()

    return util.buildResponse(200, {
        message: 'Project data updated successfully',
        metadata: updateResponse,
        updatedData: {...newProjectData}
    });

};

const deleteProjectAsync = async (projectId) => {
    const dbProject = await getProjectFromDbAsync(projectId);
    if ( !validateProjectExist(dbProject) ) return projectDoesNotExistResponse()
    
    const deleteResponse = await deleteFromDbAsync(projectId);
    return util.buildResponse(200,{
        message: 'Project deleted successfully',
        metadata: deleteResponse
    })

};

// NOT EXPORTED FUNCTIONS
const getProjectFromDbAsync = async (projectId) => {
    const params = {
        TableName: projectTable,
        Key: marshall({ projectId })
    };

    try {
        const command = new GetItemCommand(params);
        const response = await db.send(command);
        return unmarshall(response.Item);
    } catch (e) {
        return e;
    }
};

const updateProjectOnDbAsync = async (projectId, newProjectData) => {
    const params = {
        TableName: projectTable,
        Item: marshall({
            projectId,
            data: {
                ...newProjectData
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

const validateProjectExist = (project) => {
    if ( !project || !project.data || !project.projectId ) return false
    return true
};

const projectDoesNotExistResponse = () => util.buildResponse(400, { message: 'Project does not exists' });
const serverErrorResponse = () => util.buildResponse(503, { message: 'Server Error. Please try again later.'});

module.exports = {
    getAllProjectsAsync,
    createProjectAsync,
    getProjectByIdAsync,
    updateProjectAsync,
    deleteProjectAsync
};