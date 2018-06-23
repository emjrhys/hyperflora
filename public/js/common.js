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
  let channels = getChannelsAsArray(checklist),
      notInEverything = !checklist.find('.in-everything :checkbox')[0].checked

  let label = getChannelLabel(channels)
  if (notInEverything) {
    label = '*' + label
  }

  checklist.find('.anchor span').html(label)
}

$('.dropdown-checklist .anchor').click((e) => {
  let checklist = $(e.currentTarget).parent()
  if (checklist.hasClass('closed')) {
    $('.dropdown-checklist').addClass('closed')

    let distanceFromBottom = ($(document).scrollTop() + $(window).height()) - $(e.currentTarget).offset().top
    if (distanceFromBottom < 260) {
      checklist.addClass('up')
    }

    checklist.removeClass('closed')
    openDropdown = checklist
  } else {
    closeDropdown()
  }
})

$(document).click((e) => {
  if(openDropdown && !$(e.target).closest(openDropdown).length) {
    closeDropdown()
  }
})

let openDropdown
function closeDropdown() {
  openDropdown.addClass('closed')
  openDropdown = null
}
