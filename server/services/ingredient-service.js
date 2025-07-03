"use strict";
const { Ingredient } = require("../models/index.js");
const { Op } = require("sequelize");

// For infinite scroll
const getIngredientsForRecipe = async () => {
     const now = new Date();
    return await Ingredient.findAll({
        where: {
            expire_date: {
                [Op.gte]: now,
            },
        },
        order: [["expire_date", "ASC"], ["id", "ASC"]],
        limit: 10,
    });
}

module.exports = {
    getIngredientsForRecipe,
};