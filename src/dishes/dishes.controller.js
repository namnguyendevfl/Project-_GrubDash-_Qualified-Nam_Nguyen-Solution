const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

function isDishValid(req, res, next) {
    const { data: { name, description, image_url } } = req.body;
    const price = req.body.data.price;
    if ( !name || name === "") {
        return next ({
            status: 400,
            message: "Dish must include a name",
        })
    }; 
    if ( !description || description === "") {
        return next ({
            status: 400,
            message: "Dish must include a description",
        })
    }; 
    if (!price || !Number.isInteger(price) || price < 0 || price === 0) {
        return next ({
            status: 400,
            message: "Dish must have a price that is an integer greater than 0",
        })
    };
    if ( !image_url || image_url === "") {
        return next ({
            status: 400,
            message: "Dish must include a image_url",
        })
    };       
    return next();
}

function dishExists(req, res, next) {
    const dishId = Number(req.params.dishId);
    const foundDish = dishes.find((dish) => dish.id == dishId);
    if (foundDish) {
        //use res.locals.foundDish to pass foundDish to the readDish()
        res.locals.foundDish = foundDish
        return next()
    } else return next({
        status: 404,
        message: 'dishId is not found: ${req.params.dishId}'
    })
};

function readDish (req, res, next) {
    return res.json({data: res.locals.foundDish});
}


function updateDish (req, res, next) {
    const dishId = Number(req.params.dishId);
    const dish = req.body.data;
    if (!dish.id){
        const newDish = {
            ...dish,
            id : `${dishId}`
        };
        return res.json({data: newDish});
    }
    if(dishId != dish.id) return next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${dish.id}, Route: ${dishId}`
    });
    res.json({data: dish});
}


function create(req, res, next) {
    const dish = req.body.data
    const newDish = {
        id: nextId(),
        ...dish
    };  
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

function list(req,res,next) {
    res.json({data : dishes});
}

module.exports = {
    list,
    create: [isDishValid, create],
    readDish: [dishExists, readDish],
    updateDish: [dishExists, isDishValid, updateDish]
}