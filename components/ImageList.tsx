import React, { useState } from "react";
import { ImageModal } from "@/components/ImageModal";
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const ImageList = ({ images }: any) => {
    // Check if the "images" array is empty
    if (images?.length === 0) {
        return <p>No images generated yet.</p>;
    }

    const [selectedImage, setSelectedImage] = useState<string>("");

    const handleImageClick = (imageUrl: string) => {
        setSelectedImage(imageUrl);
    };

    // Function to handle the image download
    const handleDownload = async (imageUrl: any) => {
        const image = await fetch(imageUrl)
        const imageBlog = await image.blob()
        const imageURL = URL.createObjectURL(imageBlog)
        const link = document.createElement('a')
        link.href = imageURL
        link.download = 'Spooky-Picture'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    };

    const reversedImages = [...images].reverse();

    // If there are images, map over the array and render each image with a download button
    return (
        <Dialog>
            <div className="w-full grid gap-2 grid-cols-2 mt-4 min-h-40">
                {reversedImages.map((imageUrl, index) => (
                    <DialogTrigger asChild>
                        <div onClick={() => handleImageClick(imageUrl)}>
                            <div key={index} className="relative  rounded-lg  shadow-2xl h-full">
                                <img
                                    src={imageUrl}
                                    alt={`Generated Image ${index + 1}`}
                                    className="h-full object-cover object-left-top rounded-lg w-full"
                                />

                                <div
                                    className="absolute bottom-0 rounded-b-lg left-0 right-0 flex items-end  justify-center  h-2/5 w-full bg-gradient-to-t from-white via-transparent to-transparent">
                                    <button className=" mb-8  rounded-lg bg-black  px-8  py-2 text-white shadow-md"
                                        onClick={() => handleDownload(imageUrl)}
                                    >
                                        Download
                                    </button>
                                </div>

                            </div>
                        </div>
                    </DialogTrigger>

                ))}
            </div>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Selected Image</DialogTitle>
                    <DialogDescription>
                        Download and share your image!
                    </DialogDescription>
                </DialogHeader>

                
                <DialogFooter className="w-full flex ">
                    <div className=" justify-center grid items-center ">
                    {selectedImage && (
                        <img src={selectedImage} alt="Selected" className="w-full mb-4 object-contain h-60 rounded-2xl" />
                    )}
                        <button className="   rounded-lg bg-black  px-8  py-2 text-white shadow-md"
                                        onClick={() => handleDownload(selectedImage)}
                                    >
                                        Download
                                    </button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    );
};

export default ImageList;
