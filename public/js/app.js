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

/* ===============[ 2. Document Ready ]==============*/ 
$(function(){

  function page_init() {

  }
  
  $("#news-articles").on('click', '.save', function() {
    let article_id = $(this).data("article_id");
    if(article_id === undefined) return; 
    
    let ajaxParams = {
      method: "PUT",
      url: "/api/notes/" + article_id
    };

    $.ajax(ajaxParams).then(function(data){
      console.log("put", data);
    });

    $(this).closest('tr').remove();
  });

  $("#news-articles").on('click', '.edit', function() {
    let article_id = $(this).data("article_id");
    let note_id = $(this).data("note_id");
    if(article_id === undefined || note_id === undefined ) return; 

    console.log("ARTICLE_ID",article_id);
    console.log("NOTE_ID",note_id);

    $("#comment-section").slideDown();
    
    // $(this).closest('tr')
    
    // let ajaxParams = {
    //   method: "PUT",
    //   url: "/api/notes/" + article_id
    // };

    // $.ajax(ajaxParams).then(function(data){
    //   console.log("put", data);
    // });

    // $(this).closest('tr').remove();
  });
  
}); // END $(document).ready(function() { 