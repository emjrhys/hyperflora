function closeDropdown() {
  openDropdown.addClass('closed')
  openDropdown = null

  let checklist = $('.dropdown-checklist')
  let params = {
    objId: $('.admin-controls').attr('data-objId'),
    notInEverything: !checklist.find('.in-everything :checkbox')[0].checked,
    channels: getChannelsAsArray(checklist)
  }

  console.log(params)
  $.post('/api/update', { videos: [params] })
}

$('.dropdown-checklist :checkbox').change((e) => {
  updateChannelLabel($(e.currentTarget).parents('.dropdown-checklist'))
})

function updateAdminControls() {
  $('.admin-controls').attr('data-objId', nextVideo._id)
  $('.admin-controls .channels').html(nextVideo.channels.join(', '))
  $('.admin-controls .admin-link').attr('href', '/admin/' + nextVideo.searchId)

  $('.dropdown-items .in-everything :checkbox').prop('checked', !nextVideo.notInEverything)
  $('.dropdown-items .channel :checkbox').prop('checked', false)
  for (let i = 0; i < nextVideo.channels.length; i++) {
    $('.dropdown-items .channel :checkbox[value="' + nextVideo.channels[i] + '"]').prop('checked', true)
  }
  updateChannelLabel($('.dropdown-checklist'))
}
