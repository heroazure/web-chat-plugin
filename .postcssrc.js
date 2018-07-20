// https://github.com/michael-ciniawsky/postcss-load-config

module.exports = {
  'plugins': {
    // to edit target browsers: use "browserlist" field in package.json
    'autoprefixer': {
      'browsers': [
        '> 1%',
        'last 5 versions',
        'not ie <= 8'
      ]
    }
  }
}
