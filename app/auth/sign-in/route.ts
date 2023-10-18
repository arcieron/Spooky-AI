import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const formData = await request.formData()
  const email = String(formData.get('email'))
  const supabase = createRouteHandlerClient({ cookies })

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options :{
      shouldCreateUser: true,
    }
  })

  //Authenticate user


  // if (!user) {
  //   return NextResponse.json({}, {status: 401, statusText: "Unauthorized!"});
  // }

  // if (user) {
  //   const { id: user_id } = user;
  //
  //
  //   // Insert the user information into the "users" table in Supabase
  //   // const { data, error: insertError } = await supabase
  //   //     .from('users')
  //   //     .upsert([
  //   //       {
  //   //         user_id,
  //   //         email,
  //   //       },
  //   //     ], { onConflict: ['user_id'] }); // Use 'user_id' as the conflict resolution column
  //   //
  //   // if (insertError) {
  //   //   console.log("Error inserting user data: ", insertError);
  //   //   // Handle the error as needed
  //   // }
  // }



  if (error) {
    console.log("error is : ", error)
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${error.message}`,
      {
        // a 301 status is required to redirect from a POST to a GET route
        status: 301,
      }
    )
  }

  return NextResponse.redirect(
    `${requestUrl.origin}/login?message=Check email to continue sign in process`,
    {
      // a 301 status is required to redirect from a POST to a GET route
      status: 301,
    }
  )
}
