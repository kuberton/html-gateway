const express = require("express");
const app = express();
const axios = require("axios");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')

const PORT = 3000;
const API_PRODUCTS_URL = process.env.PRODUCTS_SERVICE_HOST || '34.76.34.160';
const API_BASKET_URL = process.env.BASKET_SERVICE_HOST || '34.76.59.35';
const API_PAYMENT_URL = process.env.PAYMENTS_SERVICE_HOST;

app.set("view engine", "ejs");

app.use(cookieParser());

app.use(bodyParser.urlencoded());

app.use((req, res, next) => {
  if (!req.cookies.token) res.cookie('token', Date.now(), {
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
  const { product_id: productId, quantity } = req.body

  const addNewProductToBasket = () => axios.put(`http://${API_BASKET_URL}/v1/basket`,  {
    productId,
    quantity
  },{
    headers: {
      'X-Auth': req.cookies.token,
      'Content-Type': 'application/json'
    }
  })

  addNewProductToBasket().then(() => res.redirect('/cart')).catch(e => {
    console.log(e);
    redirectToErrorPage(e, res)
  })
})

app.get('/cart', (req, res) => {
  const getAllProductsFromBasket = () => axios.get(`http://${API_BASKET_URL}/v1/basket`, {
    headers: {
      'X-Auth': req.cookies.token
    }
  }).then(({
    data = []
  }) => data)

  getAllProductsFromBasket().then(({ basketEntries: products }) => {
    const totalCost = products ? (products || []).reduce((acc, p) => {
      return acc += p.price
    }, 0) : 0
    
    res.render('cart', {
      products,
      totalCost
    })
  }).catch(e => redirectToErrorPage(e, res))
})

app.post('/payment', (req, res) => {
  const { credit_card_number, credit_card_cvv, credit_card_expiration_month, credit_card_expiration_year} = req.body
  axios.post(`http://${API_PAYMENT_URL}/v1/pay`, {
    "cardNumber": credit_card_number,
    "cvvCode": credit_card_cvv,
    "expirationDate": `${credit_card_expiration_month}/${credit_card_expiration_year}`
  }, {
    headers: {
      'X-Auth': req.cookies.token
    }
  }).then(({data}) => {
    return res.redirect('/success')
  }).catch(e => {
    // redirectToErrorPage(e, res)
    return res.redirect('/success')
  })
})

app.get('/success', (req, res) => {
  res.render("order");
})

app.get("**", (req, res) => res.render("404"));

app.listen(PORT, () => console.log(`app listening on port ${PORT}!`));