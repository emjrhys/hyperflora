$(document).ready(function() {
  $(".content").each(function(i){
      $(this).mousemove(function(e) {
          $(".ksc").each(function(i){
              $(this).css({backgroundPosition: e.pageX+"px "+e.pageY+"px"});
          });
      });
  });
});
