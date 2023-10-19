import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import hero from "/public/hero.png";

import { Button } from "@/components/ui/button";
import ExplainerSection from "@/components/ExplainerSection";
import PricingSection from "@/components/PricingSection";
import StripePricingTable from "../components/stripe/StripeTable";


export const dynamic = "force-dynamic";

export default async function Index() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();


  if (user) {
    // User is authenticated
    const { id, email } = user;

    // Check if a user with the same ID already exists in the "users" table
    const { data: existingUser, error: queryError } = await supabase
        .from('users') // Use the correct table name "users"
        .select()
        .eq('id', id)
        .single();

    if (queryError) {
      // Handle the query error if it occurs
      console.error("Error querying user data:", queryError);
    }

    if (!existingUser) {
      // If no existing user is found, create a user record
      const userData = {
        id,
        email,
        // Add any other user-related data you want to store in the "users" table
      };

      // Insert the user data into the "users" table
      const { data: newUser, error: insertError } = await supabase
          .from('users') // Use the correct table name "users"
          .upsert([userData], ); // Use 'id' as the conflict resolution column

      if (insertError) {
        // Handle the insert error if it occurs
        console.error("Error creating user record:", insertError);
      } else {
        // User record creation successful
        console.log("User record created successfully:");

        // Create a corresponding record in the "credits" table with credits set to 0
        const creditData = {
          user_id: id, // Set the user_id to the user's id
          credits: 0, // Initial credits balance
        };

        // Insert the credit data into the "credits" table
        const { data: newCreditRecord, error: creditInsertError } = await supabase
            .from('credits')
            .insert([creditData]); // Use 'user_id' as the conflict resolution column

        if (creditInsertError) {
          // Handle the insert error for credits if it occurs
          console.error("Error creating credits record:", creditInsertError);
        } else {
          // Credits record creation successful
          console.log("Credits record created successfully:", newCreditRecord);
        }
      }
    }

    // Redirect the user to the desired URL
    return redirect("overview/models/train");
  }


  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col lg:flex-row items-center gap-8 p-8 pt-0 md:pt-8 max-w-6xl w-full">
        <div className="flex flex-col space-y-4 lg:w-1/2 w-full">
          <h1 className="text-5xl font-bold">
            Transform Selfies into Spook-tacular Fun!
          </h1>
          <p className="text-gray-600 text-lg">
            Turn ordinary selfies into extraordinary Halloween masterpieces! Simply upload a photo to transform you, friends or family into hilarious, spooky, or downright wacky Halloween characters. Get ready to laugh, share, and scare with SpookyAI.
          </p>
          <div className="flex flex-col space-y-2">
            <Link href="/login">
              <Button className="w-full lg:w-1/2">Get Your Costume On</Button>
            </Link>
            <p className="text-sm text-gray-500 italic">
             
            </p>
          </div>
          {/*<div className="mt-4 text-gray-500">*/}
          {/*  <span>Already a member? </span>*/}
          {/*  <Link className="text-blue-600 hover:underline" href="/login">*/}
          {/*    Sign In*/}
          {/*  </Link>*/}
          {/*</div>*/}
        </div>
        <div className="lg:w-1/2 w-full mt-8 lg:mt-0">
          <img
            src={hero.src}
            alt="AI Headshot Illustration"
            className="rounded-lg object-cover w-full h-full"
          />
        </div>
      </div>
      <ExplainerSection />
      <PricingSection />
      {/*<StripePricingTable user={user}/>*/}
    </div>
  );
}
