const {createClient}=require('@supabase/supabase-js');
require('dotenv').config();

const url=process.env.SUPABASE_URL;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;

if(!key || !url){
    throw new Error("Missing supabase key or url")
}

const supabase=createClient(url,key);

module.exports = supabase;