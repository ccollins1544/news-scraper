/**
 * @package news-scraper
 * @subpackage apiRoutes
 * @version 1.0.0
 * 
 * -----------------------------------------------------
 * TABLE OF CONTENTS
 * 0.0 Dependencies
 * 
 * 1.0 API Routes
 *-------------------------------------------------------*/
/* ===============[ 0.0 Dependencies ]========================*/
const axios = require("axios");
const cheerio = require("cheerio");
const path = require('path');
const db = require(path.resolve(__dirname, "../models"));

/* ===============[ 1.0 API Routes ]===========================*/
module.exports = function(app){
  // A GET route for scraping
  app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with axios
    // axios.get("https://old.reddit.com/").then(function(response) {
    axios.get("https://www.ksl.com/news/utah").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);

      // Now, we grab every h2 within an article tag, and do the following:
      // $("p.title").each(function(i, element) {
      $(".queue_mn").children(".queue").each(function(i, element) {
        // Save an empty result object
        var result = {};

        var sid = $(element).data("sid");
        result.guid = sid;
        result.title = $(element).find(".headline a[data-sid='"+sid+"']").text();
        result.link = "https://www.ksl.com";
        result.link += $(element).find(".headline a[data-sid='"+sid+"']").attr("href");
        
        result.description = $(element).find(".headline").children().last().text();
        result.pubdate = $(element).find(".headline .short").text().trim();
        
        var image_element = $("<div>");
        image_element.append($(element).find(".image_box a[data-sid='"+sid+"']").children().last().html());
        result.image = image_element.find("img").attr("src");

        // console.log(result);
        
        // Create a new Article using the `result` object built from scraping
        // db.Article.create(result)
        db.Article.updateOne({'guid': sid}, {$set: result}, {upsert: true})
          .then(function(dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
          })
          .catch(function(err) {
            // If an error occurred, log it
            console.log(err);
          }); 
        
      }); 

      // Send a message to the client
      res.send("Scrape Complete");
    });
  });

  // Route for grabbing a specific Article by id, populate it with it's note
  app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // Route for saving/updating an Article's associated Note
  app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function(dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  app.put("/api/notes/:article_id", function(req, res ) {
    let newNote = {};
    newNote = {...req.body, ...{ article: req.params.article_id }};
    newNote.article = req.params.article_id;
    console.log("newNote", newNote);

    db.Note.updateOne({article: req.params.article_id}, {$set: newNote}, {upsert: true})
      .then(function(dbNote) {
        res.json(dbNote)
      })
      .catch(function(err) {
        res.json(err);
      }); 
  });
};