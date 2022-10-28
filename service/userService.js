const { DynamoDBClient, GetItemCommand, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const db = new DynamoDBClient({ region: 'sa-east-1' });

const util = require('../utils/util');

const userTable = 'RNCUserTable';

const updateUserAsync = async (id, userInfo) => {
    const surname = userInfo.surname;
    const name = userInfo.name;
    const phone = userInfo.phone;

    if (!surname) { return util.buildResponse(400, { message: 'Surname is not defined' }) }
    if (!name) { return util.buildResponse(400, { message: 'Name is not defined' }) }
    if (!phone) { return util.buildResponse(400, { message: 'Phone is not defined' }) }

    const dynamoUser = await getUserById(id);
    
    if (!dynamoUser || !dynamoUser.userData || !dynamoUser.userName ) {
        return util.buildResponse(400, { message: 'User does not exists' });
    }

    const newUserData = {
        ...userInfo,
        mail: dynamoUser.userData.mail
    };
    
    const updateResponse = await updateUser(id, newUserData);

    if (!updateResponse) {
        return util.buildResponse(503, { message: 'Server Error. Please try again later.' });
    }

    return util.buildResponse(200, {
        message: 'User data updated successfully',
        metadata: updateResponse,
        newUserData
    });
};

const getUserById = async (id) => {
    const params = {
        TableName: userTable,
        Key: marshall({ userName: id })
    };

    try {
        const command = new GetItemCommand(params);
        const response = await db.send(command);
        return unmarshall(response.Item);
    } catch (e) {
        return e;
    }
};


const updateUser = async (id, newUserData) => {
    const params = {
        TableName: userTable,
        Item: marshall({
            userName: id,
            userData: {
                ...newUserData
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

module.exports = {updateUserAsync, getUserById};