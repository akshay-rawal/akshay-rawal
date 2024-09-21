const asyncHandler = (requestHandler)=>async (req,res,next)=>{
    try {
        return await Promise.resolve(requestHandler(req, res, next));
    } catch (err) {
        return next(err);
    }
    


    
}

export default asyncHandler;
  