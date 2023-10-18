import {Database} from "@/types/supabase";
import {createRouteHandlerClient} from "@supabase/auth-helpers-nextjs";
import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import Replicate from "replicate";

export const dynamic = "force-dynamic";

const stripeIsConfigured = process.env.NEXT_PUBLIC_STRIPE_IS_ENABLED;
const replicateApiKey = process.env.REPLICATE_API_KEY; // Make sure to add this environment variable

// Helper functions
// async function convertBlobToBase64(blob) {
//     return new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.onerror = reject;
//         reader.onload = () => {
//             resolve(reader.result);
//         };
//         reader.readAsDataURL(blob);
//     });
// }


export async function POST(request: Request) {

    function getBase64(file) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            console.log(reader.result);
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
    }

    const incomingFormData = await request.formData();
    const images = incomingFormData.getAll("image") as File[];
    const type = incomingFormData.get("type") as string;
    const name = incomingFormData.get("name") as string;
    const supabase = createRouteHandlerClient<Database>({cookies});

    const {
        data: {user},
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({}, {status: 401, statusText: "Unauthorized!"});
    }

    let _credits = null;

    console.log({stripeIsConfigured});

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

        console.log(process.env.REPLICATE_API_KEY)
        const replicate = new Replicate({
            auth: process.env.REPLICATE_API_KEY,
        });

        console.log(images[0])
        const output = await replicate.run(
            "lucataco/faceswap:9a4298548422074c3f57258c5d544497314ae4112df80d116f0d2109e843d20d",
            {
                input: {
                    target_image:  new File([images[1]], 'target_image'),
                    swap_image:  new File([images[1]], 'target_image'),
                }
            }
        );

        // Create formData object to send to Replicate
        const formData = new FormData();
        images.forEach((image, index) => {
            formData.append(`image_${index}`, image);
        });
        console.log("type of", typeof images[0])
        let firstImageBase64 = null;
        let secondImageBase64 = null;
        if (images.length >= 2) {
            // firstImageBase64 = await convertBlobToBase64(images[0]);
            // secondImageBase64 = await convertBlobToBase64(images[1]);

            // formData.append('target_image', firstImageBase64)
            // formData.append('swap_image', secondImageBase64)
        } else {
            // Handle the case where not enough images are provided
            return NextResponse.json(
                {
                    message: "Not enough images provided!",
                },
                {status: 400, statusText: "Bad Request"}
            );
        }

        const response = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: {
                Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                version: "9a4298548422074c3f57258c5d544497314ae4112df80d116f0d2109e843d20d",
                // This is the text prompt that will be submitted by a form on the frontend
                input: {
                    target_image: getBase64(images[0]),
                    swap_image: getBase64(images[0])
                },
            }),
        });

        console.log({ response })

        if (response.status !== 201) {
            let error = await response.json();
            console.log({error})
            return NextResponse.json(
                {
                    message: "Something went wrong with Replicate!",
                },
                {status: 500, statusText: "Replicate Error"}
            );
        }

        const prediction = await response.json();
        // res.statusCode = 201;
        // res.end(JSON.stringify(prediction));


        console.log({prediction})

        // Check if the Replicate API request was successful
        // if (output && output.status === "success") {
        //     const imageUrl = output.result.image_url;
        //
        //     // Do something with the generated image URL, perhaps store it in your database or return it in the response.
        // } else {
        //     console.error("Replicate API request failed.");
        //     return NextResponse.json(
        //         {
        //             message: "Something went wrong with Replicate!",
        //         },
        //         {status: 500, statusText: "Replicate Error"}
        //     );
        // }

        if (stripeIsConfigured && _credits && _credits.length > 0) {
            // Existing code...
        }
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            {
                message: "Something went wrong!",
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
