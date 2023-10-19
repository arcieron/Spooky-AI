import {Database} from "@/types/supabase";
import {createRouteHandlerClient} from "@supabase/auth-helpers-nextjs";
import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import Replicate from "replicate";
import {uploadFile, getPublicUrl, createPrediction} from "./supabase";

export const dynamic = "force-dynamic";

const stripeIsConfigured = process.env.NEXT_PUBLIC_STRIPE_IS_ENABLED;
const replicateApiKey = process.env.REPLICATE_API_KEY; // Make sure to add this environment variable

async function getRandomImageName(supabase: any) {
    try {
        const folderPath = "costumes/"
        const { data, error } = await supabase.storage.from("spooky-ai").list(folderPath);

        if (error) {
            throw error;
        }

        // Extract file names from the data
        const fileNames = data.map((item: any) => item.name);

        // Pick a random file name from the array
        const randomIndex = Math.floor(Math.random() * fileNames.length);
        const randomImageName = fileNames[randomIndex];

        // console.log(`Random image name from folder '${folderPath}': ${randomImageName}`);
        return randomImageName
    } catch (error: any) {
        console.error("Error getting random image name:", error.message);
    }
}

//
// const randInt = (supabase: any) =>{
//     const min = 1;
//     const max = countFilesInFolder(supabase);
//     return  Math.floor(Math.random() * (max - min + 1)) + min;
// }

export async function POST(request: Request) {
    const incomingFormData = await request.formData();
    const images = incomingFormData.getAll("image") as File[];
    const supabase = createRouteHandlerClient<Database>({cookies});


    //Authenticate user
    const {
        data: {user},
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({}, {status: 401, statusText: "Unauthorized!"});
    }

    let _credits = null;

    //check user credits
    if (stripeIsConfigured) {
        const {error: creditError, data: credits} = await supabase
            .from("credits")
            .select("credits")
            .eq("user_id", user.id);

        console.log("credits value: ", credits);

        if (creditError) {
            console.error({creditError});
            return NextResponse.json(
                {
                    message: "Something went wrong!",
                },
                {status: 500, statusText: "Something went wrong!"}
            );
        }

        //handling no credits
        if (credits.length === 0) {
            const {error: errorCreatingCredits} = await supabase
                .from("credits")
                .insert({
                    user_id: user.id,
                    credits: 0,
                });

            if (errorCreatingCredits) {
                console.error({errorCreatingCredits});
                return NextResponse.json(
                    {
                        message: "Something went wrong!",
                    },
                    {status: 500, statusText: "Something went wrong!"}
                );
            }

            return NextResponse.json(
                {
                    message:
                        "Not enough credits, please purchase some credits and try again.",
                },
                {status: 500, statusText: "Not enough credits"}
            );
        } else if (credits[0]?.credits < 1) {
            return NextResponse.json(
                {
                    message:
                        "Not enough credits, please purchase some credits and try again.",
                },
                {status: 500, statusText: "Not enough credits"}
            );
        } else {
            _credits = credits;
        }
    }

    try {
        const replicate = new Replicate({
            auth: process.env.REPLICATE_API_KEY,
        });
        // const randomNumber = randInt(supabase)
        const uploadedFileUrl = await uploadFile(user.id, images[0])
        const randomImage = await getRandomImageName(supabase)
        let costume: string = await getPublicUrl(`costumes/${randomImage}`)
        let url2: string = "https://www.tasteofcinema.com/wp-content/uploads/2016/04/best-actors-of-our-generation-1024x627.jpg"

        const output = await replicate.run(
            "lucataco/faceswap:9a4298548422074c3f57258c5d544497314ae4112df80d116f0d2109e843d20d",
            {
                input: {
                    target_image: costume,
                    swap_image: uploadedFileUrl
                }
            }
        );

        const value = await createPrediction(user.id, output)
        console.log("create predcition value: ", value)


        if (stripeIsConfigured && _credits && _credits.length > 0) {
            const subtractedCredits = _credits[0].credits - 1;
            const { error: updateCreditError, data } = await supabase
                .from("credits")
                .update({ credits: subtractedCredits })
                .eq("user_id", user.id)
                .select("*");

            console.log({ data });
            console.log({ subtractedCredits });

            if (updateCreditError) {
                console.error({ updateCreditError });
                return NextResponse.json(
                    {
                        message: "Something went wrong!",
                    },
                    { status: 500, statusText: "Something went wrong!" }
                );
            }
        }


        return NextResponse.json(
            {
                message: "success",
                url: output
            },
            {status: 200, statusText: "Success"}
        );

    } catch (e) {
        console.error(e);
        return NextResponse.json(
            {
                message: `Something went wrong! Error:  ${e}`,
            },
            {status: 500, statusText: "Something went wrong!"}
        );
    }

    return NextResponse.json(
        {
            message: "success",
        },
        {status: 200, statusText: "Success"}
    );
}
