const router = require("express").Router({mergeParams: true});
const controller = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");
// TODO: Implement the /orders routes needed to make the tests pass

router
.route("/:orderId")
.get(controller.readOrder)
.put(controller.updateOrder)
.delete(controller.dltOrder)
.all(methodNotAllowed)

router
.route("/")
.get(controller.list)
.post(controller.create)
.all(methodNotAllowed)

module.exports = router;

