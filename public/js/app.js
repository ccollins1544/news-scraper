/**
 * @subpackage save
 * @package news-scraper
 *
 * ===============[ TABLE OF CONTENTS ]===============
 * 1. Functions
 * 2. Document Ready 
 * 
 *****************************************************/
/* ===============[ 1. Functions ]===================*/
/**
 * 1.1 AlertMessage()
 * @param {string} message - Message to go in the alert box
 * @param {string} addThisClass - defaults to empty string. Can be info, danger, or success. 
 */
function AlertMessage(message="", addThisClass="info", prependAfterElement){
  $('#alert_message').remove();

  var alertElement = $("<div>").addClass("col-12 alert").attr("id","alert_message");
  
  // RESET Alert Message
  if(message === ""){
    $("#main-section .first-row").empty();
    return;
    
  }else if (addThisClass === "info"){ 
    // Default alert
    addThisClass = "alert-info";
    
  }else if (addThisClass === "danger"){
    addThisClass = "alert-danger";
    
  }else if (addThisClass === "success"){
    addThisClass = "alert-success";
  }
  
  // IF same alert message keeps getting spammed then add ! and change color red
  if( $("#alert-messages").html() !== undefined && $("#alert-messages").html() === message ){
    message += "!";
    addThisClass = "alert-danger";
  }
  
  // Add the new class
  alertElement.addClass(addThisClass);
  
  // Display the alert message
  alertElement.html(message);

  if(prependAfterElement === undefined){
    prependAfterElement = $("#main-section");
  }

  prependAfterElement.prepend(alertElement);

  setTimeout(() => $('#alert_message').fadeOut("slow", function(){ 
    $(this).remove(); 
  }), 2000);
  return;
}

function addComment(event){
  event.preventDefault();

  let formArray = $("#add-comment-form").serializeArray();
  let formData = {};

  for (var i in formArray) {
    var KEY = "";
    var VALUE = "";

    for (var key in formArray[i]) {
      if (key == "name") {
        KEY = formArray[i][key];
      } else if (key == "value") {
        VALUE = formArray[i][key];
      }
    }
    
    formData[KEY] = VALUE.trim();
    if (formData[KEY] === "") {
      return; // prevent empty entries into database
    }
  }

  if(formData.hasOwnProperty('article_id') === false) return 

  let ajaxParams = {
    method: "POST",
    url: "/note/" + formData.article_id,
    data: formData
  };

  $.ajax(ajaxParams).then(function(data){

    let comment = $("<td>").attr("colspan",2);
    if(formData.hasOwnProperty('title')){
      comment.append("<h5>" + formData.title + "</h5>");
    }

    if(formData.hasOwnProperty('body')){
      comment.append("<p>" + formData.body + "</p>");
    }
    
    let comment_row = $("<tr>");
    comment_row.append(comment);
    $("#all_comments_table > tbody").append(comment_row);
    $("#add-comment-form")[0].reset();
  });
}

function page_init(){
  $.get("/articles").then(function(data){
    $("#news-articles > tbody").empty();
    if(data && data.length){
      renderArticles(data);
    }else{
      var emptyRow = $(
        [
          "<tr>",
          "<td colspan='2'><h6>Looks like we don't have any new articles loaded!</h6></td>",
          "<td><button class='btn btn-dark scrape' ><i class='fas fa-search'></i> Scrape Now?</button></td>",   
          "</tr>",
        ].join("")
      );
      $("#news-articles > tbody").append(emptyRow);
    }
  });
}

function renderArticles(articles){
  let articleRows = [];
  for(let i=0; i<articles.length; i++ ){
    articleRows.push(createRow(articles[i]));
  }
  $("#news-articles > tbody").append(articleRows);
};

function createRow(article){
  var row = $("<tr>").attr("id",article._id);
  var image = $("<td>").addClass("article_image").append(
    $("<span>").addClass("image_wrap").append(
      $("<a target='_blank'>")
        .attr("href", article.link)
        .attr("data-article_id", article._id)
        .attr("data-guid", article.guid)
        .append(
          $("<img>").attr("src", article.image).attr("alt", article.title)
        )
    )
  );
  
  var article_body = $("<td>").append(
    $("<a target='_blank'>")
      .attr("href", article.link)
      .attr("data-article_id", article._id)
      .attr("data-guid", article.guid)
      .append(
        $("<h6>").text(article.title)
      ),
    $("<small>").text("Posted " + article.pubdate),
    $("<p>").text(article.description)
  );

  var action_buttons = $("<td>").append(
    $("<i>").addClass("fas fa-save fa-2x save")
      .attr("title", "Save Article")
      .attr("data-article_id", article._id)
      .attr("data-guid", article.guid)
  )

  row.append(image, article_body, action_buttons);
  return row;
}

/* ===============[ 2. Document Ready ]==============*/ 
$(function(){

  $("#scrape_articles").click(function(event){
    event.preventDefault();
    $.ajax({
      method: "GET",
      url: "/scrape"
    }).then(function(data){
      AlertMessage(data, "success");
      setTimeout(() => window.location.reload(), 3000);
    });
  });

  $("#news-articles").on('click', '.scrape', function() {
    $(this).removeClass('scrape').text("Reload Page?");
    $(this).wrap("<a href='/'></a>");
    $("#scrape_articles").click();
  });

  $("#delete_articles").click(function(event){
    event.preventDefault();
    $.ajax({
      method: "DELETE",
      url: "/articles"
    }).then(function(data){
      $("#news-articles > tbody").empty();
      if(data.ok){
        AlertMessage("Deleted " + data.deletedCount + " Articles", "success");
      }else{
        AlertMessage("Failed to deleted articles. See console log for details", "danger");
      }
      page_init();
    });
  });

  $("#add-comment-form").submit(addComment);
  
  $("#news-articles").on('click', '.save', function() {
    let article_id = $(this).data("article_id");
    if(article_id === undefined) return; 
    
    let ajaxParams = {
      method: "POST",
      url: "/note/" + article_id
    };

    $.ajax(ajaxParams).then(function(data){
      let saved_articles = $("#saved_articles").text();
      saved_articles = parseInt(saved_articles) + 1;
      $("#saved_articles").text(saved_articles);
    });

    $(this).closest('tr').remove();
  });

  $("#news-articles").on('click', '.edit', function() {
    let article_id = $(this).data("article_id");
    if(article_id === undefined ) return; 

    $("#all_comments_table > tbody").empty();
    $("#comment_article_id").val(article_id)
    $("#comment-section").slideDown();
    
    let ajaxParams = {
      method: "GET",
      url: "/notes/" + article_id
    };

    $.ajax(ajaxParams).then(function(comments){

      let article_title, article_description, article_image, article_pubdate;
      
      for(let i in comments){
        let comment = $("<td>");
        if(comments[i].hasOwnProperty('title')){
          comment.append("<h5>" + comments[i].title + "</h5>");
        }

        if(comments[i].hasOwnProperty('body')){
          comment.append("<p>" + comments[i].body + "</p>");
        }

        let delete_btn = $("<button>").addClass("btn btn-light delete").attr("data-note_id",comments[i]._id).attr("data-article_id",comments[i].article._id);
        delete_btn.html("<i class='fas fa-trash-alt fa-1x'></i>");
        delete_btn = $("<td>").addClass("action_icons").append(delete_btn);

        if(article_title === undefined && comments[i].hasOwnProperty('article')){
          article_title = comments[i].article.hasOwnProperty('title') ? comments[i].article.title : "";
          article_description = comments[i].article.hasOwnProperty('description') ? comments[i].article.description : "";
          article_image = comments[i].article.hasOwnProperty('image') ? comments[i].article.image : "";
          article_pubdate = comments[i].article.hasOwnProperty('pubdate') ? comments[i].article.pubdate : "";

          $("#comment_article_title").text(article_title);
          $("#comment_article_description").text(article_description);
          $("#comment_article_image").attr("src",article_image);
          $("#comment_article_image").attr("alt",article_title);
          $("#comment_article_pubdate").text("Posted " + article_pubdate);
        }

        if(comment.is(':empty')){ continue; }
        
        let comment_row = $("<tr>").attr("id",comments[i]._id);
        comment_row.append(comment, delete_btn);
        $("#all_comments_table > tbody").append(comment_row);
      }

    });
  });

  $("#news-articles, #all_comments_table").on('click', '.delete', function() {
    let note_id = $(this).data("note_id");
    let article_id;
    let remove_row = "#" + note_id;

    let ajaxParams = {
      method: "DELETE",
      url: "/note/" + note_id
    };

    if(note_id === undefined) {
      article_id = $(this).data("article_id");
      ajaxParams.url = "/notes/" + article_id;
      if(article_id === undefined) return;
      remove_row = "#" + article_id;
      $("#comment-section").slideUp();
    }

    $.ajax(ajaxParams).then(function(data){
      let table_id = "#" + $(this).closest('table').attr("id");
      $(remove_row).remove();

      if($(this).closest('tbody').children().length === 0 && note_id === undefined){
        $(table_id).html("<tbody><tr><td><h6>No Articles Saved!</h6></td></tr></tbody>");
        let saved_articles = $("#saved_articles").text();
        saved_articles = parseInt(saved_articles);
        saved_articles = saved_articles > 0 ? saved_articles - 1 : saved_articles;
        $("#saved_articles").text(saved_articles);
      }
    });
    
  });
  
}); // END $(document).ready(function() { 