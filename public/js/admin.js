function getChannelsAsArray(checklist) {
  return checklist.find('.channel :checkbox:checked').map(function() { return this.value }).get()
}

function getChannelLabel(channels) {
  if (channels == null || channels.length == 0) {
    return 'no channels'
  }

  if (channels.length >= 3) {
    return channels.length + ' channels'
  } else {
    return channels.join(', ')
  }
}

function updateChannelLabel(checklist) {
  let channels = getChannelsAsArray(checklist)
  checklist.find('.anchor span').html(getChannelLabel(channels))
}

function updateVideos() {
  let modifiedVideos = []

  $('.dropdown-checklist.modified').each((index, elem) => {
    let params = {
      objId: $(elem).parents('li.video-item').attr('data-objId'),
      notInEverything: !$(elem).find('.in-everything :checkbox')[0].checked,
      channels: getChannelsAsArray($(elem))
    }

    $(elem).removeClass('modified')
    modifiedVideos.push(params)
  })

  if (modifiedVideos.length > 0) {
    $.post('/update', { videos: modifiedVideos })
  }
}

$('.dropdown-checklist :checkbox').change((e) => {
  let checklist = $(e.currentTarget).parents('.dropdown-checklist')
  checklist.addClass('modified')
  updateChannelLabel(checklist)
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

/* ONLOAD */
let page = $('#page').attr('data-page')
$('nav a[data-page=' + page + ']').addClass('active')

$('.filters select').each(function() {
  let value = $(this).attr('data-selected')

  if (value != null) {
    $(this).val(value)
  }
})
