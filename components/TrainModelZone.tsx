"use client";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {useToast} from "@/components/ui/use-toast";
import {zodResolver} from "@hookform/resolvers/zod";
import {useRouter} from "next/navigation";
// import { useRouter } from 'next/router'

import {useCallback, useEffect, useState} from "react";
import {useDropzone} from "react-dropzone";
import {SubmitHandler, useForm} from "react-hook-form";
import {FaFemale, FaImages, FaMale, FaRainbow} from "react-icons/fa";
import * as z from "zod";
import {fileUploadFormSchema} from "@/types/zod";
import ImageList from "./ImageList";

type FormInput = z.infer<typeof fileUploadFormSchema>;

const stripeIsConfigured = process.env.NEXT_PUBLIC_STRIPE_IS_ENABLED;

export default function TrainModelZone() {
    const [files, setFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const {toast} = useToast();
    const [generatedImage, setGeneratedImage] = useState(null);
    const [allGeneratedImages, setAllGeneratedImages] = useState([]);
    const router = useRouter();

    const form = useForm<FormInput>({
        resolver: zodResolver(fileUploadFormSchema),
        defaultValues: {
            name: "",
            type: "man",
        },
    });

    const onSubmit: SubmitHandler<FormInput> = () => {
        trainModel();
    }

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            const newFiles: File[] =
                acceptedFiles.filter(
                    (file: File) => !files.some((f) => f.name === file.name)
                ) || [];

            // if user tries to upload more than 10 files, display a toast
            if (newFiles.length + files.length > 10) {
                toast({
                    title: "Too many images",
                    description:
                        "You can only upload up to 10 images in total. Please try again.",
                    duration: 5000,
                });
                return;
            }

            // display a toast if any duplicate files were found
            if (newFiles.length !== acceptedFiles.length) {
                toast({
                    title: "Duplicate file names",
                    description:
                        "Some of the files you selected were already added. They were ignored.",
                    duration: 5000,
                });
            }

            // check that in total images do not exceed a combined 4.5MB
            const totalSize = files.reduce((acc, file) => acc + file.size, 0);
            const newSize = newFiles.reduce((acc, file) => acc + file.size, 0);

            if (totalSize + newSize > 4.5 * 1024 * 1024) {
                toast({
                    title: "Images exceed size limit",
                    description:
                        "The total combined size of the images cannot exceed 4.5MB.",
                    duration: 5000,
                });
                return;
            }

            setFiles([...files, ...newFiles]);

            toast({
                title: "Images selected",
                description: "The images were successfully selected.",
                duration: 5000,
            });
        },
        [files]
    );

    const removeFile = useCallback(
        (file: File) => {
            setFiles(files.filter((f) => f.name !== file.name));
        },
        [files]
    );

    const trainModel = useCallback(async () => {

        setIsLoading(true);
        const formData = new FormData();
        // files?.forEach((file) => {
        formData.append("image", files[0]); // Add the image Blob to the form data
        // });
        formData.append("name", form.getValues("name").trim());
        formData.append("type", form.getValues("type"));

       try {
           const  response: any  = await fetch("/leap/replicate", {
               method: "POST",
               body: formData,
           }).catch((e)=>{
               console.log("Catching error: ", e)
           });

           const body = (await response.json());
           const generatedImageUrl = body.url

           console.log({ response })
           console.log({ body })
           setGeneratedImage(generatedImageUrl)

           if (response.status == 500) {
               const responseMessage: string = body.message;
               console.error("Something went wrong! ", responseMessage);
               const messageWithButton = (
                   <div className="flex flex-col gap-4">
                       {responseMessage}
                       <a href="/get-credits">
                           <Button size="sm">
                               Get Credits
                           </Button>
                       </a>
                   </div>
               );
               setIsLoading(false);
               toast({
                   title: "Something went wrong!",
                   description: responseMessage.includes("Not enough credits") ? messageWithButton : responseMessage,
                   duration: 5000,
               });
               return;
           }

           toast({
               title: "Your Spooky Image is ready! Wait for page refresh",
               description:
                   "page will automatically relaod after 5 seconds. be patient",
               duration: 5000,
           });
           setTimeout(()=>{
               setIsLoading(false);
               location.replace(location.href);

           }, 2000)
       }catch (error){
           console.log({error})
           setIsLoading(false);
           toast({
               title: "Something went wrong!",
               description: "Sorry try again later.",
               duration: 3000,
           });

       }



    }, [files]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let formData = new FormData();
                formData.append("name", "Nothing");
                const response = await fetch('/leap/supabase/getAllPredictions',
                    {
                        method: 'POST',
                        body: formData,
                    });
                if (response.ok) {
                    const allImages = await response.json();
                    const urls = allImages.urls
                    setAllGeneratedImages(urls)
                } else {
                    toast({
                        title: "Failed to get your Spookies list",
                        description:
                            "Try again later",
                        duration: 4000,
                    });
                }
            } catch (error) {
                // Handle any network or other errors that might occur
                console.error('Error:', error);
            }
        };

        fetchData(); // Call the async function

        // Optionally, you can return a cleanup function here if needed
    }, [setAllGeneratedImages]);

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop,
        accept: {
            "image/png": [".png"],
            "image/jpeg": [".jpg", ".jpeg"],
        },
    });

    const modelType = form.watch("type");

    return (
        <div>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="rounded-md flex flex-col gap-8"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({field}) => (
                            <FormItem className="w-full rounded-md">
                                <FormLabel>Name</FormLabel>
                                <FormDescription>
                                    Give your model a name so you can easily identify it later.
                                </FormDescription>
                                <FormControl>
                                    <Input
                                        placeholder="e.g. Natalie Headshots"
                                        {...field}
                                        className="max-w-screen-sm"
                                        autoComplete="off"
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <div className="flex flex-col gap-4">
                        <FormLabel>Type</FormLabel>
                        <FormDescription>
                            Select the type of spooky you want to generate.
                        </FormDescription>
                        <RadioGroup
                            defaultValue={modelType}
                            className="grid grid-cols-3 gap-4"
                            value={modelType}
                            onValueChange={(value) => {
                                form.setValue("type", value);
                            }}
                        >
                            <div>
                                <RadioGroupItem
                                    value="man"
                                    id="man"
                                    className="peer sr-only"
                                    aria-label="man"
                                />
                                <Label
                                    htmlFor="man"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    <FaMale className="mb-3 h-6 w-6"/>
                                    Man
                                </Label>
                            </div>

                            <div>
                                <RadioGroupItem
                                    value="woman"
                                    id="woman"
                                    className="peer sr-only"
                                    aria-label="woman"
                                />
                                <Label
                                    htmlFor="woman"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    <FaFemale className="mb-3 h-6 w-6"/>
                                    Woman
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem
                                    value="person"
                                    id="person"
                                    className="peer sr-only"
                                    aria-label="person"
                                />
                                <Label
                                    htmlFor="person"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    <FaRainbow className="mb-3 h-6 w-6"/>
                                    Unisex
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div
                        {...getRootProps()}
                        className=" rounded-md justify-center align-middle cursor-pointer flex flex-col gap-4"
                    >
                        <FormLabel>Samples</FormLabel>
                        <FormDescription>
                            Upload an image of the person you want to put in a costume!
                        </FormDescription>
                        <div
                            className="outline-dashed outline-2 outline-gray-100 hover:outline-blue-500 w-full h-full rounded-md p-4 flex justify-center align-middle">
                            <input {...getInputProps()} />
                            {isDragActive ? (
                                <p className="self-center">Drop the files here ...</p>
                            ) : (
                                <div className="flex justify-center flex-col items-center gap-2">
                                    <FaImages size={32} className="text-gray-700"/>
                                    <p className="self-center">
                                        Drag 'n' drop some files here, or click to select files.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    {files.length > 0 && (
                        <div className="flex flex-row gap-4 flex-wrap">
                            {files.map((file) => (
                                <div key={file.name} className="flex flex-col gap-1">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        className="rounded-md w-24 h-24 object-cover"
                                    />
                                    <Button
                                        variant="outline"
                                        size={"sm"}
                                        className="w-full"
                                        onClick={() => removeFile(file)}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    <Button type="submit" className="w-full" isLoading={isLoading}>
                        Create Spookies {stripeIsConfigured && <span className="ml-1">(1 Credit)</span>}
                    </Button>
                </form>

            </Form>
            <div>
                <div className="text-xl font-bold text-center mt-4"> Spookies </div>
                {!(allGeneratedImages?.length === 0 || allGeneratedImages === null) ? (
                        <ImageList images={allGeneratedImages}/>
                    ) :
                    <div className="text-center text-gray-500 text-lg py-12">Your Generated Spookies will display
                        here</div>}

            </div>
        </div>
    );
}
