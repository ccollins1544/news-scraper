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

    axios.get("https://www.ksl.com/news/utah").then(function(response) {
      var $ = cheerio.load(response.data);
      $(".queue_mn").children(".queue").each(function(i, element) {
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
        
        db.Article.updateOne({'guid': sid}, {$set: result}, {upsert: true})
          .then(function(dbArticle) {
            console.log(dbArticle);
          })
          .catch(function(err) {
            console.log(err);
          }); 
      });
    }); 

    // Send a message to the client
    res.send("Scrape Complete");
  });

  app.get("/articles/:id", function(req, res) {
    db.Article.findOne({ _id: req.params.id })
      .populate("note")
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  app.delete("/articles/", function(req, res){
    db.Article.deleteMany({})
      .then(function(data){
        res.json(data);
      })
      .catch(function(err){
        res.json(err);
      });
  });

  app.get("/note/:id", function(req, res) {
    db.Note.findOne({ _id: req.params.id })
      .populate("article")
      .then(function(dbNote) {
        res.json(dbNote);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  app.delete("/note/:id", function(req, res) {
    db.Note.deleteOne({ _id: req.params.id })
      .then(function(data){
        return db.Article.update(
          { note: { $exists: true }},
          { $pull: { note: req.params.id }},
        );
      })
      .then(function(data){ 
        res.json(data);
       })
      .catch(function(err){ 
        res.json(err); 
      });
  });

  app.delete("/notes/:article_id", function(req, res) {
    db.Note.deleteMany({ article: req.params.article_id })
      .then(function(data){
        return db.Article.update(
          { _id: req.params.article_id}, 
          { $unset: { note: true }},
          { multi: true, safe: true },
        );
      })
      .then(function(data){ 
        res.json(data);
       })
      .catch(function(err){ 
        res.json(err); 
      });
  });

  app.get("/notes/:article_id", function(req, res) {
    db.Note.find({ article: req.params.article_id })
      .populate("article")
      .then(function(dbNote) {
        res.json(dbNote);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  app.post("/note/:article_id", function(req, res ) {
    let newNote = {};
    newNote = {...req.body, ...{ article: req.params.article_id }};
    newNote.article = req.params.article_id;
    
    db.Note.create(newNote)
      .then(function(dbNote){
        return db.Article.findOneAndUpdate({ _id: req.params.article_id }, { $push: { note: dbNote._id } }, { new: true });
      })
      .then(function(dbNote) {
        res.json(dbNote)
      })
      .catch(function(err) {
        res.json(err);
      }); 
  });
};