// $('.tabbutton').click((e) => {
//   $('.tabbutton, .tabcontent').removeClass('active')
//   let tab = $(e.currentTarget).attr('data-tab')
//   $('.tabbutton[data-tab=' + tab + '], .tabcontent[data-tab=' + tab + ']').addClass('active')
// })

$('.channel-select').change((e) => {
  $.post('update', { id: $(e.currentTarget).attr('data-objId'), channel: $(e.currentTarget).val() } );
})

let page = $('#page').attr('data-page')
$('nav a[data-page=' + page + ']').addClass('active')

$('.submit-nav').click((e) => {
  $('#submit').removeClass('hidden');
})

$('.channel-filter').change((e) => {
  window.location.href = '/admin?filter=' + $(e.currentTarget).val()
})
