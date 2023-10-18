'use client'
import { User } from '@supabase/supabase-js';
import React, { useEffect } from 'react';

interface StripePricingTableProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
  'pricing-table-id': string;
  'publishable-key': string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': StripePricingTableProps;
    }
  }
}

type Props = {
  user: User;
}

// <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
// <stripe-pricing-table pricing-table-id="prctbl_1O2FtYDNqblo1DI909rXRktc"
//                       publishable-key="pk_live_51O1ix3DNqblo1DI97NiAJZEVHAZK6xZIpsY9ZUzOuVplCYB27YGoJ4mph0tssMKsy0i8EwbSnq2MF8UjKszFNCnh00GDqK2knv">
// </stripe-pricing-table>

const StripePricingTable = ({ user }: Props) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://js.stripe.com/v3/pricing-table.js";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    }
  }, []);

  return (
    <div className="w-full">
      {/*<p className="text-center">DiSCROUNT FOR YOU EVERYONE</p>*/}
      <div className='flex flex-1 flex-col w-full'>
        <stripe-pricing-table
            pricing-table-id="prctbl_1O2I1HDNqblo1DI9U7DrlzAp"
            publishable-key="pk_test_51O1ix3DNqblo1DI9WUL2a114XmbmPZQviU6Oi3q9Igpaj5zMYiS1VgTqfwWh8QyCRPQdMnl5nHvSOiySmrSTmwau00UgQGEFbO"
            client-reference-id={user.id}
            customer-email={user.email}
        >
        </stripe-pricing-table>
      </div>
    </div>
  );
}

export default StripePricingTable;