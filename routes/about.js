exports.get = (req, res) => {
  res.render('about', {
    title: 'About Us',
    path: req.path
  })
}
