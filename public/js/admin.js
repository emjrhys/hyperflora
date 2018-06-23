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
    $.post('/api/update', { videos: modifiedVideos })
  }
}

$('.dropdown-checklist :checkbox').change((e) => {
  let checklist = $(e.currentTarget).parents('.dropdown-checklist')
  checklist.addClass('modified')
  updateChannelLabel(checklist)
})

function closeDropdown() {
  openDropdown.addClass('closed')
  openDropdown = null
  updateVideos()
}

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
