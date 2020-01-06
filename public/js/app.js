/**
 * @subpackage save
 * @package news-scraper
 *
 * ===============[ TABLE OF CONTENTS ]===============
 * 1. Functions
 *   1.1 AlertMessage() 
 * 
 * 2. Document Ready 
 *   2.1 
 * 
 *****************************************************/
/* ===============[ 1. Functions ]===================*/
/**
 * 1.1 AlertMessage()
 * @param {string} message - Message to go in the alert box
 * @param {string} addThisClass - defaults to empty string. Can be info, danger, or success. 
 */
function AlertMessage(message="", addThisClass="info", appendAfterElement){
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

  if(appendAfterElement === undefined){
    appendAfterElement = $("#main-section");
  }

  appendAfterElement.append(alertElement);
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
      // console.log(key+" => "+formArray[i][key]);

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

  console.log(formData);
  if(formData.hasOwnProperty('article_id') === false) return 

  let ajaxParams = {
    method: "POST",
    url: "/note/" + formData.article_id,
    data: formData
  };

  $.ajax(ajaxParams).then(function(data){
    console.log("post", data);
  });

}

/* ===============[ 2. Document Ready ]==============*/ 
$(function(){

  function page_init() {

  }

  $("#add-comment-form").submit(addComment);
  
  $("#news-articles").on('click', '.save', function() {
    let article_id = $(this).data("article_id");
    if(article_id === undefined) return; 
    
    let ajaxParams = {
      method: "POST",
      url: "/note/" + article_id
    };

    $.ajax(ajaxParams).then(function(data){
      console.log("post", data);
    });

    $(this).closest('tr').remove();
  });

  $("#news-articles").on('click', '.edit', function() {
    let article_id = $(this).data("article_id");
    if(article_id === undefined ) return; 

    // console.log("ARTICLE_ID",article_id);
    // console.log("NOTE_ID",note_id);

    $("#all_comments_table > tbody").empty();
    $("#comment_article_id").val(article_id)
    $("#comment-section").slideDown();
    
    let ajaxParams = {
      method: "GET",
      url: "/notes/" + article_id
    };

    $.ajax(ajaxParams).then(function(comments){
      console.log("GET", comments);

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

    let ajaxParams = {
      method: "DELETE",
      url: "/note/" + note_id
    };

    if(note_id === undefined) {
      article_id = $(this).data("article_id");
      ajaxParams.url = "/notes/" + article_id;
      if(article_id === undefined) return;
      $("#comment-section").slideUp();
    }

    console.log(ajaxParams);

    $.ajax(ajaxParams).then(function(data){
      console.log("delete", data);
    });

    $(this).closest('tr').remove();
    
  });
  
}); // END $(document).ready(function() { 