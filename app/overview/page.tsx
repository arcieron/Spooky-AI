import ClientSideModelsList from "@/components/realtime/ClientSideModelsList";
import { Database } from "@/types/supabase";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import {useEffect} from "react";
import {router} from "next/client";
import {redirect} from "next/navigation";

// export const dynamic = "force-dynamic";

// export default async function Index() {
//   const supabase = createServerComponentClient<Database>({ cookies });

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     return <div>User not found</div>;
//   }

//   const { data: models } = await supabase
//     .from("models")
//     .select(
//       `*, samples (
//       *
//     )`
//     )
//     .eq("user_id", user.id);

//   return <ClientSideModelsList serverModels={models ?? []} />;
// }
export default async function Index() {

  const supabase = createServerComponentClient<Database>({ cookies });


  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>User not found</div>;
  }

  return redirect("overview/models/train");


  if(user){
    const { data: models } = await supabase
        .from("models")
        .select(
            `*, samples (
      *
    )`
        )
        .eq("user_id", user?.id as string);


    return <ClientSideModelsList serverModels={models ?? []} />;
  }


}
