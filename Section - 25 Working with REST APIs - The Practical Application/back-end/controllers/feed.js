const { validationResult }= require('express-validator')

exports.getPosts = (req,res,next)=>{
    res.status(200).json({
        posts:[{_id:"1",title:"First Post",content:'this is the first post!',imageUrl:"images/nigaCat.jpeg",creator:{
            name:"M16"
            },
        createdAt: new Date()}]
    })
}

exports.creatPost = (req,res,next)=>{
    const errors = validationResult(req)
    if (!errors.isEmpty())
    {
     return res.status(422).json({message:'validation failed ,entered data is not correct',errors:errors.array()})
    }
    const title = req.body.title;
    const content = req.body.content;

    res.status(201).json({
        message: "post created successfully",
        post:{_id:new Date().toISOString(),title:title,content:content,creator:{
            name:"M16"
            },createdAt: new Date()}
    })
}