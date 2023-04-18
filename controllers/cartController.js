const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");

const getCartItems = asyncHandler(async (req, res) => {
  const items = await Cart.find({ customer: req.params.id });
  res.json(items);
});

const getTotal = asyncHandler(async (req, res) => {
  var loopData = {};
  var loopData = new Object();
  const items = await Cart.find({ customer: req.params.id });
  var total = 0;
  var i = 0;
  while (i < items.length) {
    total =
      total + (items[i].price - items[i].discountPrice) * items[i].quantity;
    i++;
  }
  var loopData = {
    totalPrice: total,
  };
  res.json(loopData);
});

const addToCart = asyncHandler(async (req, res) => {
  const {
    customer,
    productName,
    category,
    productCode,
    picURL,
    price,
    discountNote,
    discountPrice,
    quantity,
  } = req.body;

  if (
    !customer ||
    !productName ||
    !category ||
    !productCode ||
    !picURL ||
    !price ||
    !discountNote ||
    !discountPrice ||
    !quantity
  ) {
    res.status(400);
    throw new Error("Failed adding items to cart");
  } else {
    const item = await Cart.findOne({
      customer: customer,
      productName: productName,
    });
    if (item) {
      throw new Error("Already in cart");
    } else {
      const product = await Product.findOne({
        productCode: productCode,
      });
      if (product) {
        product.quantity = product.quantity - 1;
        const updatedProduct = await product.save();
      }
      const cart = new Cart({
        customer,
        productName,
        category,
        productCode,
        picURL,
        price,
        discountNote,
        discountPrice,
        quantity,
      });

      const createdCart = await cart.save();

      res.status(201).json(createdCart);
    }
  }
});

const updateCart = asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  const cart = await Cart.findById(req.params.id);

  const product = await Product.findOne({ productCode: cart.productCode });
  var previousQuantity = cart.quantity;
  if (previousQuantity > quantity) {
    product.quantity = product.quantity + 1;
    const updatedProduct = await product.save();
  } else if (previousQuantity < quantity) {
    product.quantity = product.quantity - 1;
    const updatedProduct = await product.save();
  }

  if (cart) {
    cart.quantity = quantity;

    const updatedCart = await cart.save();
    res.json(updatedCart);
  } else {
    res.status(404);
    throw new Error("Item not found");
  }
});

const deleteCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findById(req.params.id);

  if (cart) {
    await cart.remove();
    res.json({ message: "Item Removed" });
  } else {
    res.status(404);
    throw new Error("Item not Found");
  }
});

const deleteAllCartItems = asyncHandler(async (req, res) => {
  await Cart.deleteMany({ customer: req.params.id });

  Cart.deleteMany({ customer: req.params.id })
    .then((result) => {
      res.json({ message: "Items Removed" });
    })
    .catch((err) => {
      res.status(404);
      throw new Error("Items not Found");
    });
});

module.exports = {
  getCartItems,
  addToCart,
  updateCart,
  deleteCartItem,
  deleteAllCartItems,
  getTotal,
};
