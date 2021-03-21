const advancedResults = (model,populate) => async (req,res,next)=>{
    let query;
    //copy req.query
    const reqQuery = {...req.query};   

    // Fields to exclude
    const removeFields = ['select','sort','page','limit'];

    //loop over removeFields and delete them from reqQuery
    removeFields.forEach( param => delete  reqQuery[param]);

    //Create Query String
    let queryStr = JSON.stringify(reqQuery);

    // Create Operators ($gt,$lte)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match => `$${match}`)
    // finding Resources that match query
    query = model.find(JSON.parse(queryStr));

    // SELECT fields
     if(req.query.select){
         const fields = req.query.select.split(',').join(' ');
         console.log(fields);
         query = query.select(fields);
     }

     //Sort by fields
     if(req.query.sort){
         const sortBy = req.query.sort.split(',').join(' ');
         query = query.sort(sortBy);
     }else {
         query = query.sort('-createdAt')
     }

     // pagination
     const page = parseInt(req.query.page,10) || 1;
     const limit = parseInt(req.query.limit,10)||25;
     const startIndex = (page - 1)*limit;
     const endIndex = (page * limit);
     const total = await model.countDocuments();

     query = query .skip(startIndex).limit(limit);

     if(populate){
         query = query.populate(populate);
     }

     // paginnation result
     const pagination = {};

    // executing query
    const results = await query;

     if(endIndex < total){
         pagination.next ={
             page:page+1,
             limit,
         }
     }

     if(startIndex > 0){
         pagination.prev ={
             page:page-1,
             limit,
         }
     }

     res.advancedResults = {
         sucess:true,
         count:results.length,
         pagination,
         data:results,
     }

     next();

};

module.exports = advancedResults;