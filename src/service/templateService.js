const { v4: uuidv4 } = require('uuid');
const { DynamoDBClient, ScanCommand, GetItemCommand, PutItemCommand, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const db = new DynamoDBClient({ region: 'sa-east-1' });

const util = require('../utils/util');

const templateTable = 'TemplateTable';


const getAllTemplatesAsync = async () => {
    const params = {
        TableName: templateTable,
    };

    try {
        const command = new ScanCommand(params);
        const response = await db.send(command);
        const listResponse = response.Items?.map( item => {
            const commonItem = unmarshall(item)
            return {
                id: commonItem.templateId,
                ...commonItem.details
            }
        });
        return util.buildResponse(200, listResponse);
        
    } catch (e) {
        return util.buildResponse(500, e);;
    }
};

const createTemplateAsync = async (newTemplate) => {
    const newId = uuidv4();
    const params = {
        TableName: templateTable,
        Item: marshall({
            templateId: newId,
            details: {
                ...newTemplate
            }
        }),
    } 
    
    try {
        const command = new PutItemCommand(params);
        const response = await db.send(command);
        if (!response) return serverErrorResponse

        return util.buildResponse(200, {
            message: 'Template created successfully',
            metadata: response,
            template: {
                id: newId,
                ...newTemplate
            }
        });
    } catch (e) {
        return e
    }
};

const getTemplateByIdAsync = async (templateId) => {
    const dbTemplate = await getTemplateFromDbAsync(templateId);
    if ( !validateTemplateExist(dbTemplate) ) return templateDoesNotExistResponse()

    const templateResponse = {
        id: templateId,
        ...dbTemplate.details
    }
    return util.buildResponse(200, templateResponse);

};

const updateTemplateAsync = async (templateId, templateBody) => {
    const dbTemplate = await getTemplateFromDbAsync(templateId);
    if ( !validateTemplateExist(dbTemplate) ) return templateDoesNotExistResponse()

    const newTemplateData = {
        ...templateBody
    };

    const updateResponse = await updateTemplateOnDbAsync(templateId, newTemplateData);

    if (!updateResponse) return serverErrorResponse()

    return util.buildResponse(200, {
        message: 'Template data updated successfully',
        metadata: updateResponse,
        updatedData: {...newTemplateData}
    });

};

const deleteTemplateAsync = async (templateId) => {
    const dbTemplate = await getTemplateFromDbAsync(templateId);
    if ( !validateTemplateExist(dbTemplate) ) return templateDoesNotExistResponse()
    
    const deleteResponse = await deleteFromDbAsync(templateId);
    return util.buildResponse(200,{
        message: 'Template deleted successfully',
        metadata: deleteResponse
    })

};

// NOT EXPORTED FUNCTIONS
const getTemplateFromDbAsync = async (templateId) => {
    const params = {
        TableName: templateTable,
        Key: marshall({ templateId })
    };

    try {
        const command = new GetItemCommand(params);
        const response = await db.send(command);
        return unmarshall(response.Item);
    } catch (e) {
        return e;
    }
};

const updateTemplateOnDbAsync = async (templateId, newTemplateData) => {
    const params = {
        TableName: templateTable,
        Item: marshall({
            templateId,
            details: {
                ...newTemplateData
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

const deleteFromDbAsync = async (templateId) => {
    const params = {
        TableName: templateTable,
        Key: marshall({ templateId })
    };

    try {
        const command = new DeleteItemCommand(params);
        const response = await db.send(command);
        return unmarshall(response);
    } catch (e) {
        return e;
    }
};

const validateTemplateExist = (template) => {
    if ( !template || !template.details || !template.templateId ) return false
    return true
};

const templateDoesNotExistResponse = () => util.buildResponse(400, { message: 'Template does not exists' });
const serverErrorResponse = () => util.buildResponse(503, { message: 'Server Error. Please try again later.'});

module.exports = {
    getAllTemplatesAsync,
    createTemplateAsync,
    getTemplateByIdAsync,
    updateTemplateAsync,
    deleteTemplateAsync
};