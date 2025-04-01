// stripe-checkout.js
// Netlify Function to create Stripe Checkout Session for a subscription

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  let plan;

  try {
    const body = JSON.parse(event.body);
    plan = body.plan;
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid or missing JSON body" }),
    };
  }

  // Define the mapping of plan slugs to Stripe Price IDs
  const priceMap = {
    "1l-monthly": "price_1QzixXClYp4p5ca6bso9AD9j",
    "1l-quarterly": "price_1QzizLClYp4p5ca6AgRnTUUi",
    "1l-biannual": "price_1Qzj0lClYp4p5ca6DBrDHt6n",
    "2l-monthly": "price_1Qzj3qClYp4p5ca6RfS9wPWv",
    "2l-quarterly": "price_1Qzj5mClYp4p5ca6P64G7q6f",
    "2l-biannual": "price_1Qzj7EClYp4p5ca6GimR1rVS",
    "3l-monthly": "price_1Qzj8gClYp4p5ca6GDHQUs5y",
    "3l-quarterly": "price_1QzjA6ClYp4p5ca6pH19JVGW",
    "3l-biannual": "price_1QzjCvClYp4p5ca6PSC6gPsT",
  };
  
  const priceId = priceMap[plan];

  if (!priceId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid plan selected." }),
    };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: "https://yourdomain.com/tack",
      cancel_url: "https://yourdomain.com/avbrutet",
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
