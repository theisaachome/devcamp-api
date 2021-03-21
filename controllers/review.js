const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');



// @desc    Get Review
// @route   GET /api/v1/views/
// @route   GET /api/v1/bootcamps/:bootcampId/reviews
// @access  Public 
exports.getReviews = asyncHandler(async(req,res,next)=>{
   
    if(req.params.bootcampId){
       const reviews =await Review.find({ bootcamp:req.params.bootcampId});

       return res.status(200).json({
           success:true,
           count:reviews.length,
           data:reviews,
       });
    }else{
       res.status(200).json(res.advancedResults);
    }
    
});




// @desc    Get single Review
// @route   GET /api/v1/views/:id
// @access  Public 
exports.getReview = asyncHandler(async(req,res,next)=>{
   const review = await Review.findById(req.params.id)
   .populate({
       path:'bootcamp',
       select:'name description'
   });

   if(!review){
       return next(new ErrorResponse(`No Reviews found with id of ${req.params.id}`,404));
   }
   res.status(200).json({
       success:true,
       review,
   })

});


// @desc    POST Review
// @route   POST /api/v1/bootcamps/:bootcampId/reviews
// @access  private 
exports.addReview = asyncHandler(async(req,res,next)=>{
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
    if(!bootcamp){
        return next(new ErrorResponse(` No Bootcamp with the id of ${req.params.bootcampId}`,404));
    }
    const review =  await Review.create(req.body);
    res.status(201).json({
        success:true,
        review,
    });
 
 });


// @desc    Update Review
// @route   PUT /api/v1/reviews/:id
// @access  private 
exports.updateReview = asyncHandler(async(req,res,next)=>{
    
    let review = await Review.findById(req.params.id);
    if(!review){
        return next(new ErrorResponse(` No Review with the id of ${req.params.id}`,404));
    }
    //make sure review belong to user or user is admin
    if(review.user.toString() === req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(` Not Authorize to update Reivew`,401));
    }
     review =  await Review.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
    });
    res.status(200).json({
        success:true,
        review,
    });
 
 });




// @desc    Delete Review
// @route   DELETE /api/v1/reviews/:id
// @access  private 
exports.deleteReview = asyncHandler(async(req,res,next)=>{
    
    let review = await Review.findById(req.params.id);
    if(!review){
        return next(new ErrorResponse(` No Review with the id of ${req.params.id}`,404));
    }
    //make sure review belong to user or user is admin
    if(review.user.toString() === req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(` Not Authorize to update Reivew`,401));
    }
    await review.remove();
    res.status(200).json({
        success:true,
        data:{}
    });
 
 });