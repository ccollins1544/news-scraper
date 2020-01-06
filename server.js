/**
 * @package news-scraper
 * @subpackage server
 * @author Christopher Collins
 * @version 2.0.0
 * @license none (public domain)
/* ===============[ Dependencies  ]========================*/
const express = require("express");
const mongoose = require("mongoose");
const express_handlebars = require("express-handlebars");
const logger = require("morgan");
const path = require("path");

/* ===============[ Express Config ]=======================*/
const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static content for the app from the "public" directory.
app.use(express.static(path.join(__dirname, 'public')));

// Connect to the MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(
  process.env.MONGODB_URI || 
  "mongodb://localhost/news_scraper", 
  { 
    useNewUrlParser: true,
    useUnifiedTopology: true 
  }
);


// Handlebars
var hbs = require(path.join(__dirname, 'helpers/handlebars.js'))(express_handlebars);
app.engine('handlebars', hbs.engine);
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "handlebars");

// Routes
require(path.join(__dirname, "routes/apiRoutes"))(app);
require(path.join(__dirname, "routes/htmlRoutes"))(app); 

// Starting the server
app.listen(PORT, function() {
  console.log(
    "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
    PORT,
    PORT
  );
});

module.exports = app;  