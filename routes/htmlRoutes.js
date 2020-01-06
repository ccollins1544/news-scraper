/**
 * @package news-scraper
 * @subpackage htmlRoutes
 * @version 1.0.0
 * 
 * -----------------------------------------------------
 * TABLE OF CONTENTS
 * 0.0 Dependencies
 * 
 * 1.0 HTML Routes
 *-------------------------------------------------------*/
/* ===============[ 0.0 Dependencies ]========================*/
const path = require('path');
const db = require(path.resolve(__dirname, "../models"));

/* ===============[ 1.0 HTML Routes ]===========================*/
module.exports = function(app){

  // Load index page
  app.get("/", function(req, res) {

    db.Article.find({}).then(function(dbArticles) {
      res.render("index", {
        page_title: "Latest News", 
        articles: dbArticles
      });
    });
  });

  // Load saved page
  app.get("/saved", function(req, res) {

    db.Note.find({})
    .populate("article")
    .then(function(dbArticles){
      let savedArticles = dbArticles.map(N => { N.article.note_id = N._id; return N.article; } );

      res.render("saved", {
        page_title: "Saved Articles", 
        articles: savedArticles
      });

    })
    .catch(function(err){
      res.json(err);
    });

  });

  // Route for getting all Articles from the db
  app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
};