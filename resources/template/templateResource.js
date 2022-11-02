const util = require('../../utils/util')
const templateService = require('../../service/templateService');

const resourceMethod = async(event) => { 
    let response;
    let body;

    switch (event.httpMethod) {
        case 'GET':
            response = await templateService.getAllTemplatesAsync();
            break;

        case 'POST':
            body = JSON.parse(event.body);
            response = await templateService.createTemplateAsync(body);
            break;

        default:
            response = util.buildResponse(404, '404 - Not Found');
            break;
    }
    return response;
}

module.exports = { resourceMethod };