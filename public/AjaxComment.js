(function($) {
  var commentForm = $("#newCommentForm"),
  commentLabel = $("#reply");

  function bindEventsToTodoItem(todoItem) {
  todoItem.find(".finishItem").on("click", function(event) {
    event.preventDefault();
    var currentLink = $(this);
    var currentId = currentLink.data("id");

    var requestConfig = {
      method: "POST",
      //url to bind comment to review
      url: "/review/" + currentId
    };

    $.ajax(requestConfig).then(function(responseMessage) {
      var newElement = $(responseMessage);
      bindEventsToTodoItem(newElement);
      todoItem.replaceWith(newElement);
    });
  });
}

  myNewTaskForm.submit(function(event) {
    event.preventDefault();

    var newComment = commentForm.val();
    var newContent = $("#new-content");

    if (newComment) {
      var useJson = true;
      if (useJson) {
        var requestConfig = {
          method: "POST",
          url: "/review/comment",
          contentType: "application/json",
          data: JSON.stringify({
            comment: newComment
          })
        };

        $.ajax(requestConfig).then(function(responseMessage) {
          console.log(responseMessage);
          newContent.html(responseMessage.message);
          //                alert("Data Saved: " + msg);
        });
      } else {
        var requestConfig = {
          method: "POST",
          url: "/review/comment",
          contentType: "application/json",
          data: JSON.stringify({
            comment: newComment
          })
        };

        $.ajax(requestConfig).then(function(responseMessage) {
          console.log(responseMessage);
          var newElement = $(responseMessage);
          bindEventsToTodoItem(newElement);
        });
      }
    }
  });

})(window.jQuery);
