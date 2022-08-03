addEventListener('fetch', event => {
  event.passThroughOnException()
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(event_request) {
  let request = new Request(event_request)
  let rurl = new URL(request.url)
  let sparams = new URLSearchParams(rurl.searchParams)
  let pmap = new Map(sparams)
  let pobj = Object.fromEntries(pmap)
  let edited = false

  let final_bitrate = ''
  let plex_product = sparams.has('X-Plex-Product')
    ? sparams.get('X-Plex-Product')
    : ''
  let plex_platform = sparams.has('X-Plex-Platform')
    ? sparams.get('X-Plex-Platform')
    : ''
  let plex_device_name = sparams.has('X-Plex-Device-Name')
    ? sparams.get('X-Plex-Device-Name')
    : ''
  let plex_device = sparams.has('X-Plex-Device')
    ? sparams.get('X-Plex-Device')
    : ''

  let autoquality_supported = [
    'Plex Web',
    'Plex for iOS',
    'Plex for Android',
    'Plex for Apple TV',
  ]
  
  if (sparams.has('maxVideoBitrate')) {
    br = 20000 
    final_bitrate = br.toString()
    sparams.set('maxVideoBitrate', br.toString())
  }
  if (sparams.has('videoBitrate')) {
    br = 20000
    final_bitrate = br.toString()
    sparams.set('videoBitrate', br.toString())
  }


  if (sparams.has('X-Plex-Client-Profile-Extra')) {
    let extras = sparams.get('X-Plex-Client-Profile-Extra')
    let limits = extras.split('+')

    const killit =
      'add-limitation(scope=videoCodec&scopeName=*&type=upperBound&name=video.bitrate'
    let filtered = limits.filter(
      target =>
        !(
          target.includes('add-limitation') &&
          target.includes('name=video.bitrate')
        ),
    )
    let newextras = limits
      .filter(
        target =>
          !(
            target.includes('add-limitation') &&
            target.includes('name=video.bitrate')
          ),
      )
      .join('+')

    let regexps = new RegExp(/name=video.bitrate&value=[^&]+/i)
    let killregex = new RegExp(
      /add-limitation\(scope=videoCodec&scopeName=*&type=upperBound&name=video.bitrate\)/i,
    )
    let replaced_extras = extras.replace(
      /name=video.bitrate&value=[^&]+/gi,
      `name=video.bitrate&value=${final_bitrate}`,
    )
    sparams.set('X-Plex-Client-Profile-Extra', replaced_extras)

  }

  let editedparams = Object.fromEntries(new Map(sparams))

  pobj = editedparams
  rurl.search = sparams.toString()

  request = new Request(rurl, request)

  let response = await fetch(request)
  return response
}
