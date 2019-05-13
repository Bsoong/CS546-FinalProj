(function($) {
  $("[class^='comment-box']").hide()
    $("button[class^='reply']").click(function(){
      var v = $(this).attr("data-logged");
      if(v=="true"){
        var c = $(this).attr("data-id");
        $("[class^='comment-box']").hide();
        $("button[class^='reply']").show();
        $("[class^='comment-box']").filter("[data-id="+c+"]").show();
        $(this).hide();
      } else {
        alert("You have to be logged in to reply.");
      }
    });
    $("[class^='cancel']").click(function(){
      var c = $(this).attr("data-id");
      $("[class^='comment-box']").filter("[data-id="+c+"]").hide();
      $("[class^='reply']").filter("[data-id="+c+"]").show();
    });
    $("[class^='comment-form']").submit(function(event){
      event.preventDefault();
      var rID = $(this).attr("data-id");
      var newComment = $("input[data-id^="+rID+"]").val();
      if(newComment){
        var requestConfig = {
          method: "POST",
          url: "/review/comment/"+rID,
          data: JSON.stringify({
            comment: newComment,
            reviewID: rID
          })
        };
        $.ajax(requestConfig).then(function(responseMessage) {
          var newElement = $(responseMessage);
          if(jQuery.type(newElement)==="string"){
            alert(newElement);
          } else {
            $(".comments").filter("data-id=" + rID + "]").append(newElement);
          }
        });
      } else {
        alert("You must type in something to comment.");
      }
    });
})(window.jQuery);
