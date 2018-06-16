$('.tabbutton').click((e) => {
  $('.tabbutton, .tabcontent').removeClass('active')
  let tab = $(e.currentTarget).attr('data-tab')
  $('.tabbutton[data-tab=' + tab + '], .tabcontent[data-tab=' + tab + ']').addClass('active')
})

$('.channel-select').change((e) => {
  $.post('update', { id: $(e.currentTarget).attr('data-objId'), channel: $(e.currentTarget).val() } );
})
