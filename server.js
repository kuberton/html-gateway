const express = require("express");
const app = express();
const axios = require("axios");
const cookieParser = require('cookie-parser');
const nanoid = require('nanoid')
const bodyParser = require('body-parser')

const PORT = 3000;
const API_PRODUCTS_URL = process.env.PRODUCTS_SERVICE_HOST || '34.76.34.160';
const API_BASKET_URL = process.env.BASKET_SERVICE_HOST || '34.76.59.35';
const API_PAYMENT_URL = process.env.PAYMENTS_SERVICE_HOST;

app.set("view engine", "ejs");

app.use(cookieParser());

app.use(bodyParser.urlencoded());

app.use((req, res, next) => {
  if (!req.cookies.token) res.cookie('token', nanoid(), {
    httpOnly: true
  })
  next()
})

const redirectToErrorPage = (e, res) => res.render('error', {
  error: e
})

app.get("/error", (req, res) => res.render("error"));

app.get("/", (req, res) => {
  const getAllProducts = () => axios.get(`http://${API_PRODUCTS_URL}/v1/products`).then(({
    data
  }) => data)

  getAllProducts().then(products => res.render("home", {
    products
  })).catch(e => redirectToErrorPage(e, res))
})

app.get("/product/:id", (req, res) => {
  const {
    id
  } = req.params
  if (!id || isNaN(id)) return redirectToErrorPage('id must be a number', res)

  const getProductData = () => axios.get(`http://${API_PRODUCTS_URL}/v1/products/${id}`).then(({
    data
  }) => data)

  getProductData().then(product => res.render("product", {
    product
  })).catch(e => redirectToErrorPage(e, res))

});

app.get("/order/:id", (req, res) => res.render("order"));

app.post('/add-new-product', (req, res) => {
  const { uid: productId, quantity } = req.body

  const addNewProductToBasket = () => axios.put(`http://${API_BASKET_URL}/v1/basket`, {
    headers: {
      'X-Auth': req.cookies.token
    },
    data: {
      productId,
      quantity
    }
  })

  addNewProductToBasket().then(() => res.redirect('/cart')).catch(e => redirectToErrorPage(e, res))
})

app.get('/cart', (req, res) => {
  const getAllProductsFromBasket = () => axios.get(`http://${API_BASKET_URL}/v1/basket`, {
    headers: {
      'X-Auth': req.cookies.token
    }
  }).then(({
    data = []
  }) => data)

  const products = [
    { uid: 1, name: 'foo', price: 300, quantity: 2 },
    { uid: 1, name: 'foo', price: 12, quantity: 2 }
  ]

  const totalCost = products.reduce((acc, p) => {
    return acc += p.price
  }, 0)

  res.render('cart', {
    products,
    totalCost
  })

  getAllProductsFromBasket().then(products => {
    res.render('cart', {
      products
    })
  }).catch(e => redirectToErrorPage(e, res))
})

app.get('/order', (req, res) => res.render('order'))

app.get("**", (req, res) => res.render("404"));

app.listen(PORT, () => console.log(`app listening on port ${PORT}!`));