// $('.tabbutton').click((e) => {
//   $('.tabbutton, .tabcontent').removeClass('active')
//   let tab = $(e.currentTarget).attr('data-tab')
//   $('.tabbutton[data-tab=' + tab + '], .tabcontent[data-tab=' + tab + ']').addClass('active')
// })

$('.dropdown-checklist :checkbox').change((e) => {
  let checklist = $(e.currentTarget).parents('.dropdown-checklist'),
      id = checklist.attr('data-objId'),
      channels = checklist.find(':checkbox:checked').map(function() {
        return this.value
      }).get()

  $.post('update', { id: id, channel: channels } );
  checklist.find('.anchor span').html(channels.join(','))
})

$('.dropdown-checklist .anchor').click((e) => {
  let items = $(e.currentTarget).next('.dropdown-items')
  if (items.hasClass('hidden')) {
    $('.dropdown-items').addClass('hidden')
    items.removeClass('hidden')
  } else {
    items.addClass('hidden')
  }
})

let page = $('#page').attr('data-page')
$('nav a[data-page=' + page + ']').addClass('active')

$('.submit-nav').click((e) => {
  $('#submit').removeClass('hidden');
})

$('.channel-filter').change((e) => {
  let filter = $(e.currentTarget).val()

  if (filter == 'all')
    window.location.href = '/admin'
  else
    window.location.href = '/admin?filter=' + filter
})
