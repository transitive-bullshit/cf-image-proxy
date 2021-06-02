import test from 'ava'
import { normalizeUrl } from './normalize-url'

test('main', (t) => {
  t.is(normalizeUrl('http://sindresorhus.com'), 'https://sindresorhus.com')
  t.is(normalizeUrl('http://sindresorhus.com '), 'https://sindresorhus.com')
  t.is(normalizeUrl('http://sindresorhus.com.'), 'https://sindresorhus.com')
  t.is(normalizeUrl('http://SindreSorhus.com'), 'https://sindresorhus.com')
  t.is(normalizeUrl('http://sindresorhus.com'), 'https://sindresorhus.com')
  t.is(normalizeUrl('HTTP://sindresorhus.com'), 'https://sindresorhus.com')

  // TODO: why isn't this parsed correctly by Node.js URL?
  // t.is(normalizeUrl('//sindresorhus.com'), 'https://sindresorhus.com')

  t.is(normalizeUrl('http://sindresorhus.com'), 'https://sindresorhus.com')
  t.is(normalizeUrl('http://sindresorhus.com:80'), 'https://sindresorhus.com')
  t.is(normalizeUrl('https://sindresorhus.com:443'), 'https://sindresorhus.com')
  t.is(normalizeUrl('ftp://sindresorhus.com:21'), 'ftp://sindresorhus.com')
  t.is(
    normalizeUrl('https://sindresorhus.com/foo/'),
    'https://sindresorhus.com/foo'
  )
  t.is(
    normalizeUrl('http://sindresorhus.com/?foo=bar baz'),
    'https://sindresorhus.com/?foo=bar+baz'
  )
  t.is(
    normalizeUrl('https://foo.com/https://bar.com'),
    'https://foo.com/https://bar.com'
  )
  t.is(
    normalizeUrl('https://foo.com/https://bar.com/foo//bar'),
    'https://foo.com/https://bar.com/foo/bar'
  )
  t.is(
    normalizeUrl('https://foo.com/http://bar.com'),
    'https://foo.com/http://bar.com'
  )
  t.is(
    normalizeUrl('https://foo.com/http://bar.com/foo//bar'),
    'https://foo.com/http://bar.com/foo/bar'
  )
  t.is(
    normalizeUrl('https://sindresorhus.com/%7Efoo/'),
    'https://sindresorhus.com/~foo',
    'decode URI octets'
  )
  t.is(normalizeUrl('https://sindresorhus.com/?'), 'https://sindresorhus.com')
  t.is(normalizeUrl('https://êxample.com'), 'https://xn--xample-hva.com')
  t.is(
    normalizeUrl('https://sindresorhus.com/?b=bar&a=foo'),
    'https://sindresorhus.com/?a=foo&b=bar'
  )
  t.is(
    normalizeUrl('https://sindresorhus.com/?foo=bar*|<>:"'),
    'https://sindresorhus.com/?foo=bar*%7C%3C%3E%3A%22'
  )
  t.is(
    normalizeUrl('https://sindresorhus.com:5000'),
    'https://sindresorhus.com:5000'
  )
  t.is(
    normalizeUrl('https://sindresorhus.com/foo#bar'),
    'https://sindresorhus.com/foo#bar'
  )
  t.is(
    normalizeUrl('https://sindresorhus.com/foo/bar/../baz'),
    'https://sindresorhus.com/foo/baz'
  )
  t.is(
    normalizeUrl('https://sindresorhus.com/foo/bar/./baz'),
    'https://sindresorhus.com/foo/bar/baz'
  )
  t.is(
    normalizeUrl(
      'https://i.vimeocdn.com/filter/overlay?src0=https://i.vimeocdn.com/video/598160082_1280x720.jpg&src1=https://f.vimeocdn.com/images_v6/share/play_icon_overlay.png'
    ),
    'https://i.vimeocdn.com/filter/overlay?src0=https%3A%2F%2Fi.vimeocdn.com%2Fvideo%2F598160082_1280x720.jpg&src1=https%3A%2F%2Ff.vimeocdn.com%2Fimages_v6%2Fshare%2Fplay_icon_overlay.png'
  )
})

test('removeTrailingSlash and removeDirectoryIndex options)', (t) => {
  t.is(
    normalizeUrl('https://sindresorhus.com/path/'),
    'https://sindresorhus.com/path'
  )
  t.is(
    normalizeUrl('https://sindresorhus.com/#/path/'),
    'https://sindresorhus.com/#/path/'
  )
  t.is(
    normalizeUrl('https://sindresorhus.com/foo/#/bar/'),
    'https://sindresorhus.com/foo#/bar/'
  )
})

test('sortQueryParameters', (t) => {
  t.is(
    normalizeUrl('https://sindresorhus.com/?a=Z&b=Y&c=X&d=W'),
    'https://sindresorhus.com/?a=Z&b=Y&c=X&d=W'
  )
  t.is(
    normalizeUrl('https://sindresorhus.com/?b=Y&c=X&a=Z&d=W'),
    'https://sindresorhus.com/?a=Z&b=Y&c=X&d=W'
  )
  t.is(
    normalizeUrl('https://sindresorhus.com/?a=Z&d=W&b=Y&c=X'),
    'https://sindresorhus.com/?a=Z&b=Y&c=X&d=W'
  )
  t.is(normalizeUrl('https://sindresorhus.com/'), 'https://sindresorhus.com')
})

test('invalid urls', (t) => {
  t.throws(() => {
    normalizeUrl('http://')
  }, 'Invalid URL: http://')

  t.throws(() => {
    normalizeUrl('/')
  }, 'Invalid URL: /')

  t.throws(() => {
    normalizeUrl('/relative/path/')
  }, 'Invalid URL: /relative/path/')
})

test('remove duplicate pathname slashes', (t) => {
  t.is(
    normalizeUrl('https://sindresorhus.com////foo/bar'),
    'https://sindresorhus.com/foo/bar'
  )
  t.is(
    normalizeUrl('https://sindresorhus.com////foo////bar'),
    'https://sindresorhus.com/foo/bar'
  )
  t.is(
    normalizeUrl('ftp://sindresorhus.com//foo'),
    'ftp://sindresorhus.com/foo'
  )
  t.is(
    normalizeUrl('https://sindresorhus.com:5000///foo'),
    'https://sindresorhus.com:5000/foo'
  )
  t.is(
    normalizeUrl('https://sindresorhus.com///foo'),
    'https://sindresorhus.com/foo'
  )
  t.is(
    normalizeUrl('https://sindresorhus.com:5000//foo'),
    'https://sindresorhus.com:5000/foo'
  )
  t.is(
    normalizeUrl('https://sindresorhus.com//foo'),
    'https://sindresorhus.com/foo'
  )
})
