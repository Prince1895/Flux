const verifyJWT=async(req,res,next)=>{
    const token=req.header.authorization;
    if(!token)return res.status(401).json({error:"Unauthorized access"})
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if(error || !user)return res.status(401).json({error: "Invalid Token"});
    req.user=user;
    next();
}