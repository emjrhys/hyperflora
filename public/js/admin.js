function updateVideos() {
  let modifiedVideos = []

  $('.dropdown-checklist.modified').each((index, elem) => {
    let params = {
      objId: $(elem).parents('li.video-item').attr('data-objId'),
      notInEverything: !$(elem).find('.in-everything :checkbox')[0].checked,
      channels: $(elem).find('.channel :checkbox:checked').map(function() { return this.value }).get()
    }

    $(elem).find('.anchor span').html(getChannelLabel(params.channels))
    $(elem).removeClass('modified')
    modifiedVideos.push(params)
  })

  $.post('/update', { videos: modifiedVideos })
}

$('.dropdown-checklist :checkbox').change((e) => {
  $(e.currentTarget).parents('.dropdown-checklist').addClass('modified')
})

let dropdownOpen
function closeDropdown() {
  dropdownOpen.addClass('closed')
  dropdownOpen = null
  updateVideos()
}

$('.dropdown-checklist .anchor').click((e) => {
  let checklist = $(e.currentTarget).parent()
  if (checklist.hasClass('closed')) {
    $('.dropdown-checklist').addClass('closed')
    checklist.removeClass('closed')
    dropdownOpen = checklist
  } else {
    closeDropdown()
  }
})

$(document).click((e) => {
  if(dropdownOpen && !$(e.target).closest(dropdownOpen).length) {
    closeDropdown()
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
  if (channels == null || channels.length == 0) {
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
