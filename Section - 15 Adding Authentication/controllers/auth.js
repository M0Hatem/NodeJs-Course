const User = require("../models/user");
exports.getLogin = (req, res, next) => {
    res.render('auth/login',
        {path: '/login',
        pageTitle: 'Login',
        isAuthenticated:  req.session.loggedin
        });
};
exports.postLogin = (req, res, next) => {
    User.findById('65505eccb307e3b65348b589').then((user)=>{
    req.session.loggedin=true;
    req.session.user =user
    req.session.save(()=>{
    res.redirect("/")
    })
    })
    .catch(err=>console.log(err))
};

exports.postLogout = (req, res, next) => {
     req.session.destroy(()=>{
         res.redirect('/')
     })
};