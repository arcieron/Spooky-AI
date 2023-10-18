import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "../../../types/supabase";


const getPublicUrl = async (path: string) => {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    try {
        const { data } = await supabase.storage.from('spooky-ai').getPublicUrl(path);
        return data.publicUrl;
    } catch (error) {
        // Handle error
        console.error("Error in getPublicUrl:", error);
        throw error;
    }
};

const uploadFile = async (user_id: string,  file: File) => {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    try {
        const fileName = file.name; // Get the file name
        const { data, error } = await supabase.storage.from('spooky-ai')
            .upload(`/user_uploaded_images/${user_id}/${fileName}`, file,{
                upsert: true,
                cacheControl: '3600',
            } );
        if (error) {
            throw error;
        }

        let pathUrl = await getPublicUrl(data.path)
        return pathUrl;
    } catch (error) {
        // Handle error
        console.error("Error in uploadFile:", error);
        throw error;
    }
};

const createPrediction = async (user_id, image_url)=>{
    const supabase = createRouteHandlerClient<Database>({ cookies });

    const {data,  error } = await supabase
        .from('predictions')
        .insert(
            {  user_id: user_id, image_url: image_url },
        ).select()

    if (error){
        throw error
    }

    return data

}

const getAllPredictionsOfUser  = async (user_id)=>{
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data, error } = await supabase
        .from('predictions')
        .select('image_url')
        .eq('user_id', user_id);

    if (error) {
        throw error
    }
    const imageUrlArray = data.map(prediction => prediction.image_url);
    return imageUrlArray


}





export { getPublicUrl, uploadFile, createPrediction };
