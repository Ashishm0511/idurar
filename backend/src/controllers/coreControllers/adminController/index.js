// The correct relative path from this file to the middlewaresControllers folder is one level up
const createUserController = require('../middlewaresControllers/createUserController');
module.exports = createUserController('Admin');
