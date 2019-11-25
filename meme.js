const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Meme = new Schema(
    {
        title: { type: String, default: null },
        description: { type: String, default: null },
        year: { type: String, default: null },
        version: { type: String, default: '0' }
    },
    { timestamps: true } /* Com esse campo, o mongoose é capaz de gerenciar os campos 'createdAt' e 'updatedAt' */
)

module.exports = mongoose.model('Meme', Meme);