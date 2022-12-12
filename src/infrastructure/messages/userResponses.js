const util = require('../../utils/util');

const userDoesNotExistResponse = () => util.buildResponse(400, { message: 'User does not exists' });

module.exports = {
    userDoesNotExistResponse
}
