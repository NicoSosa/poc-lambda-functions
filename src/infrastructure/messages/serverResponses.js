const util = require('../../utils/util');

const dataBaseErrorResponse = () => util.buildResponse(503, { message: 'Database Error. Please try again later.'});
const serverErrorResponse = () => util.buildResponse(503, { message: 'Server Error. Please try again later.'});

module.exports = {
    dataBaseErrorResponse,
    serverErrorResponse
}