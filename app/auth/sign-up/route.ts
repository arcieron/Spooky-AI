import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const formData = await request.formData()
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))
  const supabase = createRouteHandlerClient({ cookies })

  // const { error } = await supabase.auth.signUp({
  //   email,
  //   password,
  //   options: {
  //     // Set up email redirection after successful sign-up
  //     emailRedirectTo: `${requestUrl.origin}/auth/callback`,
  //   },
  // })

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Set up email redirection after successful sign-up
      emailRedirectTo: `${requestUrl.origin}/auth/callback`,
    },
  })

  if (error) {
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=Could not authenticate user`,
      {
        // a 301 status is required to redirect from a POST to a GET route
        status: 301,
      }
    )
  }

  // If the sign-up is successful, you can access the user's email from the formData
  // and use it to send a confirmation email or perform other actions.
  // For example:
  sendConfirmationEmail(email);

  return NextResponse.redirect(
    `${requestUrl.origin}/login?message=Check email to continue sign in process`,
    {
      // a 301 status is required to redirect from a POST to a GET route
      status: 301,
    }
  )
}

// Define a function to send a confirmation email
function sendConfirmationEmail(email: any) {
  // Implement the logic to send an email confirmation to the user's email address.
  // You can use a third-party email service like SendGrid, Nodemailer, etc., to send emails.
  // For simplicity, this is just a placeholder function.
  console.log(`Sending confirmation email to ${email}`);
}
