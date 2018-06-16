$('.tabbutton').click((e) => {
  $('.tabcontent').removeClass('active')
  let tab = $(e.currentTarget).attr('data-tab')
  $('.tabcontent[data-tab=' + tab + ']').addClass('active')
})
