const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const db = new DynamoDBClient({ region: 'sa-east-1' });

const userTable = 'UserTable';

const userResnposes = require('../infrastructure/messages/userResponses');
const serverResponses = require('../infrastructure/messages/serverResponses');

const util = require('../utils/util');


// NOT HTTP FUNCTIONS
const getUserFromDbAsync = async (userId) => {
    const params = {
        TableName: userTable,
        Key: marshall({userId})
    };
    
    try {
        const command = new GetItemCommand(params);
        const response = await db.send(command);

        if(!response || !response.Item) return { hasError: true, errorResponse: userResnposes.userDoesNotExistResponse}

        const dbUser = unmarshall(response.Item);

        return { hasError: false, dbUser }
    } catch (e) {
        return { hasError: true, errorResponse: serverResponses.serverErrorResponse };
    }
};

module.exports = {
    getUserFromDbAsync
};