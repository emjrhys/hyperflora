$('.dropdown-checklist :checkbox').change((e) => {
  let checklist = $(e.currentTarget).parents('.dropdown-checklist'),
      id = checklist.parents('li.video-item').attr('data-objId'),
      inEverything = checklist.find('.in-everything :checkbox')[0].checked,
      channels = checklist.find('.channel :checkbox:checked').map(function() {
        return this.value
      }).get()

  $.post('/update', { id: id, channel: channels, notInEverything: !inEverything });
  checklist.find('.anchor span').html(getChannelLabel(channels))
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

$('.filters select').change((e) => {
  let channelFilter = $('#channel-filter').val(),
      visibilityFilter = $('#visibility-filter').val()

  window.location.href = '/admin?channel=' + channelFilter + '&visibility=' + visibilityFilter
})

$('.submit-nav').click((e) => {
  $('#submit').removeClass('hidden');
})

function getChannelLabel(channels) {
  if (channels == null) {
    return 'no channels'
  }

  if (typeof channels === 'string') {
    return channels
  } else if (channels.length >= 3) {
    return channels.length + ' channels'
  } else {
    return channels.join(', ')
  }
}

/* ONLOAD */
let page = $('#page').attr('data-page')
$('nav a[data-page=' + page + ']').addClass('active')

$('.filters select').each(function() {
  let value = $(this).attr('data-selected')
  
  if (value != null) {
    $(this).val(value)
  }
})
