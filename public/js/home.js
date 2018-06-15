$(document).ready(function() {
  var xPos = 0, yPos = 0, yOffset = 0

  $('.content').each(function(i){
    $(this).mousemove(function(e) {
      xPos = e.pageX
      yPos = e.pageY
      $('.ksc').each(function(i){
          $(this).css({backgroundPosition: xPos+'px '+(yPos+yOffset)+'px'})
      })
    })
  })

  setInterval(function() {
    $('.ksc').each(function(i) {
      $(this).css({backgroundPosition: xPos+'px '+(yPos+yOffset)+'px'})
    })
    yOffset = yOffset + 1
  }, 40)
})
