const express = require('express')
const app = express()
const axios = require('axios')
const PORT = 3000
const API_PRODUCTS_URL = process.env.PRODUCTS_SERVICE_HOST
const API_BASKET_URL = process.env.BASKET_SERVICE_HOST
const API_PAYMENT_URL = process.env.PAYMENTS_SERVICE_HOST

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    const products = [
        { name: 'foo', price: 100, id: 'XYZ', photo: 'https://images.unsplash.com/photo-1551334741-0f11da38e980?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60' },
        { name: 'bar', price: 100, id: 'ZYZ', photo: 'https://images.unsplash.com/photo-1551334741-0f11da38e980?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60' }
    ]

    res.render('home', { products })
})

app.get('/product/:id', (req, res) => {
    const product = { name: 'foo', price: 100, descr: 'lorem ipsum dolorem', id: 'XYZ', photo: 'https://images.unsplash.com/photo-1551334741-0f11da38e980?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60' }
    res.render('product', { product })
})

app.get('/error', (req, res) => res.render('error'))

app.get('/order/:id', (req, res) => res.render('order'))

app.get('/cart/:id', (req, res) => res.render('cart'))

app.get('/debug', (req, res) => {
    axios.get(`http://${API_PAYMENT_URL}`).then(({ data }) => {
        res.render('debug', { data })
    }).catch(e => res.render('error', { error }))
})

app.get('**', (req, res) => res.render('404'))

app.listen(PORT, () => console.log(`app listening on port ${PORT}!`))
