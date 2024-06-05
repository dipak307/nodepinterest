var express = require('express');
var router = express.Router();
const userModel=require("./users");
const postModel=require("./post");
const passport=require("passport");
const upload=require("./multer");


const localStrategy=require("passport-local");
 passport.use(new localStrategy(userModel.authenticate()))


 router.post("/login",passport.authenticate("local",{
  successRedirect: "/profile",
  failureRedirect:"/login",
  failureFlash:true
 }
), function(req,res){
 
})

router.get("/login",function(req,res){
  // console.log(req.flash("error"))
   res.render("login",{error:req.flash('error')});
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/profile", isLoggedIn ,async function(req,res){
const user=await userModel.findOne({
  username:req.session.passport.user
})
.populate("posts")
console.log(user);
  res.render("profile",{user});
})

router.get("/feed",function(req,res){
   res.render('feed');
})

router.post("/upload", isLoggedIn , upload.single("file") , async function(req,res,next){
  if(!req.file){
    return  res.status(404).send("no file were given");
  }
  // res.send("file upload successfully..")
  const user=await userModel.findOne({
    username:req.session.passport.user
  })
    //  .populate("posts")
    
  const posts =await postModel.create({
    image: req.file.filename,
    imageText: req.body.filecaption,
    user:user._id
   })
   
console.log(posts._id)
     user.posts.push(posts._id);
     await user.save();
  //  res.send("done");
  res.redirect("/profile")
   
})




router.post("/register",function(req,res){
  //we can write two line code
  const {username,email,fullname}=req.body;
  const userData=new userModel({username,email,fullname});
  // const userData=new userModel({
  //   username: req.body.username,  
  //   email: req.body.email,
  //   fullName:req.body.fullname,
  // })
  userModel.register(userData,req.body.password)
     .then(function(){
      passport.authenticate("local")(req,res,function(){
        res.redirect("/profile")
      })
     })
})


router.get("/logout", function(req,res){
   req.logout(function(err){
    if(err){ return next(err);}
    res.redirect("/");
   })
})

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()) return next();
  res.redirect("/login");
}

module.exports = router;





