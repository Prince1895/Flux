const supabase = require('../config/supabaseClient');

exports.signup = async(req,res)=>{
    const{email,password,company_name}=req.body;
    try{
        const {data:tenant , error:tenantError}= await supabase.from('tenants').insert([{name:company_name}]).select().single();
        if(tenantError) throw tenantError;
        const{data: authData, error:authError} =await supabase.auth.signUp({email,password,options: {data: {tenant_id: tenant.id, role: 'admin'}}});
        if(authError)throw authError;
        res.status(201).json({
            message: "Signup successful! Please check your email to verify.",
            user: authData.user
        });
    }
    catch(err){
        res.status(400).json({error:err.message});
    }
}

exports.login= async(req,res)=>{
    const {email,password}=req.body;
    const { data, error } = await supabase.auth.signInWithPassword({email,password});
    if(error)return res.status(401).json({error:error.message});
    res.status(200).json({
        message:"Login Successful",
        session:data.session,
        user:data.user
    })
}