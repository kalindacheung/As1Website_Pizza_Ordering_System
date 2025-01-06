// ----------------------- General ------------------------//
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Support JSON data
app.use(express.static(__dirname + '/public'));
// ----------------------- Connect to MongoDB ------------------------// 
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error:', err));
// ----------------------- Import MongoDB Models ------------------------//
const MenuItem = require('./models/menuItem');
const Order = require('./models/order');
// ----------------------- Routes for Update MenuItems by POSTMAN ------------------------//
const menuRoutes = require('./routes/menu');
app.use('/menuItems', menuRoutes);
// ----------------------- Start Server ------------------------//
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));


// ----------------------- Endpoint: Home Page: Display Restaurant Info ------------------------//
app.get('/', (req, res) => {
  const restaurant = {
    name: 'ARBYS',
    location: '123 Food St, Flavor Town',
    hours: 'Mon-Sun 10am-9pm'
  };
  res.render('index', { restaurant });
});

// ----------------------- Endpoint: Menu Page: Show Menu Items from the Database ------------------------//
app.get('/menu', async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.render('menu', { menuItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ----------------------- Endpoint: Order Form Page: Place a order ------------------------//
app.get('/order', async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.render('order-form', { menuItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/order', async (req, res) => {
  const { customerName, customerAddress, customerPhoneNumber, customerEmail, paymentMethod, creditCardDetails, items } = req.body;

  const orderItems = [];
  let totalPrice = 0;  // Initialize total price

  for (const pizzaItem in items) {
    if (items[pizzaItem].selected === 'true') {
      const quantity = parseInt(items[pizzaItem].quantity);
      // Find the menu item by ID and scalculate price for this item (price * quantity)
      const menuItem = await MenuItem.findById(pizzaItem);
      const itemTotalPrice = menuItem.price * quantity;
      totalPrice += parseFloat(itemTotalPrice.toFixed(2));  // Add to the total price

      // Push the item details to the orderItems array
      orderItems.push({
        item: pizzaItem, // Store the item ID for referencing in the database
        name: menuItem.name, // Get the item name
        price: menuItem.price, // Get the item price
        quantity: quantity
      });
    }
  }
  totalPrice = parseFloat(totalPrice.toFixed(2));

  // Create the new order with the calculated total price
  try {
    const orderData = new Order({
      customerName,
      customerAddress,
      customerPhoneNumber,
      customerEmail,
      paymentMethod,
      items: orderItems,
      totalPrice
    });
    // If payment is by credit, add credit card details
    if (paymentMethod === 'credit') {
      orderData.creditCardDetails = {
        cardNumber: creditCardDetails.cardNumber,
        cardHolderName: creditCardDetails.cardHolderName,
        expiryDate: creditCardDetails.expiryDate,
        cvv: creditCardDetails.cvv
      };
    }
    const newOrder = new Order(orderData);
    await newOrder.save();
    res.render('order-confirmation', { order: newOrder });
    
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

// ----------------------- Endpoint: Order Status Page: Check Order Status ------------------------//
app.get('/order-status', (req, res) => {
  res.render('order-status', { order: null, error: null }); // Pass null for order and error
});

// Order Status: Check Order Status (POST)
app.post('/order-status', async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const order = await Order.findById(orderId).populate('items');
    res.render('order-status', { order, error: null }); // Pass order and set error to null
  } catch (error) {
    res.status(500).render('order-status', { order: null, error: ' Order not found!' }); // Pass error message
  }
});
