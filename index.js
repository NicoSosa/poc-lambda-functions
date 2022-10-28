const util = require('./utils/util')

const userService = require('./service/userService');

const taskPackagePath = '/taskPackage';
const userPath = '/user/{id}';

exports.handler = async (event, context, callback) => {
    let response;
    console.log('Request Event', event);
    switch (true) {
        case event.httpMethod === 'POST' && event.path === taskPackagePath:
            // const loginBody = JSON.parse(event.body);
            // response = await loginService.login(loginBody);
            break;
            
        case event.httpMethod === 'GET' && event.resource === userPath:
            const getId = event.pathParameters.id;
            const user = await userService.getUserById(getId);
            if (!user || !user.userData || !user.userName) {
                response = util.buildResponse(400, { message: 'User does not exists' });
            } else {
                const userResponse = {
                    userId: user.userName,
                    userData: {...user.userData}
                }
                response = util.buildResponse(200, userResponse);
            }
            break;
            
        case event.httpMethod === 'PUT' && event.resource === userPath:
            const putId = event.pathParameters.id;
            const userBody = JSON.parse(event.body);
            response = await userService.updateUserAsync(putId, userBody);
            break;
        
        case event.httpMethod === 'POST':
            const loginUser = JSON.parse(event.body);
            response = await loginService.login(loginUser);
            break;
        
        default:
            response = util.buildResponse(404, '404 - Not Found');
    }
    return response;
};
