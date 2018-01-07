const fs = require('fs')
const path = require('path')

exports.get = (req, res) => {
  if (req.query.image && fs.existsSync(path.join(UPLOAD_DIR, req.query.image))) {
    const fileName = req.query.image
    return res.render('indexUploaded', {
      title: 'Result',
      path: req.path,
      image: `images/uploads/${fileName}`,
      backUrl: `${req.protocol}://${req.get('host')}${req.path}?image=${fileName}`
    })
  }

  return res.render('indexUpload', {
    title: 'Upload',
    path: req.path
  })
}

exports.post = (req, res, next) => {
  // NOTE: Split the url into an array and then get the last chunk and render it out in the send req.
  const pathArray = req.file.path.split('/')
  const fileName = pathArray[(pathArray.length - 1)]
  return res.redirect(`?image=${fileName}`)
}
