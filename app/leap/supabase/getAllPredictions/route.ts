import {createRouteHandlerClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
// import { Database } from "../../../types/supabase";
import {Database} from "../../../../types/supabase";
import {NextResponse} from "next/server";


export async function POST(request: Request) {
    console.log("request")
    const supabase = createRouteHandlerClient < Database > ({cookies});

    const {
        data: {user},
    } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({}, {status: 401, statusText: "Unauthorized!"});
    }

    try {
        const {data, error} = await supabase
            .from('predictions')
            .select('image_url')
            .eq('user_id', user.id);

        if (error) {
            console.log({error })
            throw error
        }


        let uris =  data.map(prediction => prediction.image_url)
        return NextResponse.json(
            {
                message: "success",
                urls: uris
            },
            {status: 200, statusText: "Success"}
        );
    }catch (e) {
        console.error({e})

        return NextResponse.json({}, {status: 401, statusText: "Error Occured!"});
    }



}
