// const config = require('config.json');
// const jwt = require('jsonwebtoken');
const db = require('_helpers/db');
const Game = db.Game;

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete,
};


async function getAll() {
    return await Game.find().select('');
}

async function getById(id) {
    return await Game.findById(id).select('');
}

async function create(param) {
    // validate
    if (await Game.findOne({ name: param.name })) {
        throw 'Game "' + param.name + '" is already taken';
    }

    const game = new Game(param);

    // save game
    await game.save();
}

async function update(id, param) {
    const game = await Game.findById(id);

    // validate
    if (!game) throw 'Game not found';
    if (game.name !== param.name && await Game.findOne({ name: param.name })) {
        throw 'Name "' + param.name + '" is already taken';
    }
    if(param.image == '') {
        param.image = game.image;
    }

    // copy userParam properties to user
    Object.assign(game, param);
    await game.save();
}

async function _delete(id) {
    await Game.findByIdAndRemove(id);
}