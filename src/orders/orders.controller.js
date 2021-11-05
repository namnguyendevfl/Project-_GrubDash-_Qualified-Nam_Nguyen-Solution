const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

function isOrderValid (req, res, next) {
    const {data : { id, deliverTo, mobileNumber, status, dishes} } = req.body;   
    if (!deliverTo || deliverTo === "") {
        return next({
            status: 400,
            message: `Order must include a deliverTo`
        })
    };    
    if (!mobileNumber || mobileNumber === "") {
        return next({
            status: 400,
            message: `Order must include a mobileNumber`
        })
    };   
    if (!dishes || !Array.isArray(dishes) || dishes.length === 0 ) {
        return next({
            status: 400,
            message: `Order must include  at least one dish`
        })
    };       
    dishes.forEach((dish, index) => {
        const quantity = dish.quantity;
        if (!quantity || !Number.isInteger(quantity) || quantity < 0 || quantity === 0) {
            return next ({
                status: 400,
                message: `Dish ${index} must have a quantity that is an integer greater than 0`,
            })
        }    
    });    
    return next();
}

function list(req, res, next) {
    res.json({data: orders});
}

function create(req, res, next) {   
    const { data } = req.body;
    const newData = {
        id: nextId(),
        ...data,       
    };
    orders.push(newData);
    res.status(201).json({data: newData});
}

function orderExists(req, res, next) {
    const orderId = req.params.orderId;
    const foundOrder = orders.find((order) => order.id == Number(orderId));
    if (foundOrder === undefined) return next({
        status: 404,
        message: `orderId is not found: ${req.params.orderId}`
    });
    //use res.locals.foundDish to pass foundDish to the readDish()
    res.locals.foundOrder = foundOrder;
    return next();
}

function readOrder(req, res, next) {
    res.json({ data: res.locals.foundOrder });
}

function updateOrder(req, res, next) {
    const orderId = Number(req.params.orderId);
    const newOrder = req.body.data;
    const orderStatus = newOrder.status;
    if (newOrder.id && Number(newOrder.id) !== orderId) return next({
        status: 400,
        message: `Order id does not match route id. Order: ${newOrder.id}, Route: ${orderId}`,
    });   
    if (!orderStatus || orderStatus === "" || orderStatus === "invalid") return next({
        status: 400,
        message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
    });   
    if (orderStatus === "delivered") return next({
        status: 400,
        message: `A delivered order cannot be changed`,
    });   
    const newData = {
        ...newOrder,
        id : `${orderId}`
    };
    res.json({data: newData});
}


function dltOrder(req, res, next) {
    const { orderId } = req.params;  
    const idx = orders.findIndex((order) => Number(order.id) === Number(orderId));
    if (idx === -1 ) {
        return next({
            status: 404,
            message: `no matching order is found ${orderId}`
            
        })
    };
    const orderStatus = orders[idx].status;
    if (orderStatus !== "pending") {
        return next({
            status: 400,
            message: `	An order cannot be deleted unless it is pending`
            
        })        
    };
    const deletedOrders = orders.splice(idx, 1);
    res.sendStatus(204);
}

module.exports = {
    list,
    create: [isOrderValid, create],
    readOrder: [orderExists, readOrder],
    updateOrder: [isOrderValid, orderExists, updateOrder],
    dltOrder
}