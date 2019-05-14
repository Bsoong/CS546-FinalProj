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
    $("form").submit(function(event){
      event.preventDefault();
      var rID = $(this).attr("data-id");
      var newComment = $("input[data-id^="+rID+"]").val();
      if(newComment){
        // alert(rID);
        var requestConfig = {
          method: "POST",
          url: "/review/comment/"+rID,
          contentType: "application/json",
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
            if($(".comment-title").filter("[data-id=" + rID + "]").length){
              $(".comments").filter("[data-id=" + rID + "]").append(newElement);
              $("input[data-id^="+rID+"]").val('');
            } else {
              $(".comments").filter("[data-id=" + rID + "]").append('<p class="comment-title" data-id='+rID+'>Comments: </p>');
              $(".comments").filter("[data-id=" + rID + "]").append(newElement);
              $("input[data-id^="+rID+"]").val('');
            }
          }
        });
      } else {
        alert("You must type in something to comment.");
      }
    });
})(window.jQuery);
