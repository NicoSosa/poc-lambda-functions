const util = require('../../utils/util')
const templateService = require('../../service/templateService');

const resourceMethod = async(event) => { 
    let response;
    let id;
    let body;

    switch (event.httpMethod) {
        case 'GET':
            id = event.pathParameters.id;
            response = await templateService.getTemplatetByIdAsync(id);
            break;

        case 'PUT':
            id = event.pathParameters.id;
            body = JSON.parse(event.body);
            response = await templateService.updateTemplateAsync(id, body);
            break;

        case 'DELETE':
            id = event.pathParameters.id;
            response = await templateService.deleteTemplateAsync(id);
            break;

        default:
            response = util.buildResponse(404, '404 - Not Found');
            break;
    }
    return response;
}

module.exports = { resourceMethod };