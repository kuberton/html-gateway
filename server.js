const express = require("express");
const app = express();
const axios = require("axios");
const cookieParser = require('cookie-parser');
const nanoid = require('nanoid')
const bodyParser = require('body-parser')

const PORT = 3000;
const API_PRODUCTS_URL = process.env.PRODUCTS_SERVICE_HOST;
const API_BASKET_URL = process.env.BASKET_SERVICE_HOST;
const API_PAYMENT_URL = process.env.PAYMENTS_SERVICE_HOST;

app.set("view engine", "ejs");

app.use(cookieParser());

app.use(bodyParser.urlencoded());

app.use((req, res, next) => {
  if (!req.cookies.token) res.cookie('token', nanoid(), { httpOnly: true })
  next()
})

const redirectToErrorPage = (e, res) => res.render('error', { error: e })

app.get("/", (req, res) => {
  const getAllProducts = () => axios.get(`http://${API_PRODUCTS_URL}/v1/products`).then(({ data }) => data)

  getAllProducts().then(products => res.render("home", {
    products
  })).catch(e => redirectToErrorPage(e, res))
})

app.get("/product/:id", (req, res) => {
  const { id } = req.params
  if (!id || isNaN(id)) return redirectToErrorPage('id must be a number', res)

  const getProductData = () => axios.get(`http://${API_PRODUCTS_URL}/v1/products/${id}`).then(({ data }) => data)

  getProductData().then(product => res.render("product", {
    product
  })).catch(e => redirectToErrorPage(e, res))

});

app.get("/error", (req, res) => res.render("error"));

app.get("/order/:id", (req, res) => res.render("order"));

app.post('/cart', (req, res) => {
  const addNewProductToBasket = () => new Promise(resolve => setTimeout(resolve, 1000))
  const getAllProductsFromBasket = () => new Promise(resolve => setTimeout(resolve, 1000))

  addNewProductToBasket().then(() => {
    getAllProductsFromBasket().then(products => {
      res.render('cart', { products })
    }).catch(e => redirectToErrorPage(e, res))
  }).catch(e => redirectToErrorPage(e, res))
})

app.get("/debug", (req, res) => {
  axios
    .get(`http://${API_PAYMENT_URL}`)
    .then(({
      data
    }) => {
      res.render("debug", {
        data
      });
    })
    .catch(e => res.render("error", {
      error
    }));
});

app.get("**", (req, res) => res.render("404"));

app.listen(PORT, () => console.log(`app listening on port ${PORT}!`));