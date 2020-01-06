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
      let saved_array = dbArticles.map( A => A.note.filter( N => N != null ).length !== 0 ? 1 : 0 );
      const reducer = (accumulator, currentValue) => accumulator + currentValue;

      res.render("index", {
        page_title: "Latest News", 
        articles: dbArticles,
        article_count: dbArticles.length,
        articles_saved: dbArticles.length === 0 ? 0 : saved_array.reduce(reducer)
      });
    });
  });

  // Load saved page
  app.get("/saved", function(req, res) {

    db.Article.find({ 'note' : { $exists: true, $ne: null } })
      .populate("note")
      .then(function(dbArticles){       
        const reducer = (accumulator, currentValue) => accumulator + currentValue;
        let saved_array = dbArticles.map( A => A.note.filter( N => N != null ).length !== 0 ? 1 : 0 );

        res.render("saved", {
          page_title: "Saved Articles", 
          articles: dbArticles,
          articles_saved: dbArticles.length === 0 ? 0 : saved_array.reduce(reducer)
        });
        
      })
      .catch(function(err){
        res.json(err);
      });

  });

  app.get("/articles", function(req, res) {
    db.Article.find({})
      .populate("note")
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });
};