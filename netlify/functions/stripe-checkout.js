
// netlify/functions/stripe-checkout.js

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // ✅ Handle CORS preflight request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "OK",
    };
  }

  let plan;

  try {
    const body = JSON.parse(event.body);
    plan = body.plan;
  } catch (err) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Invalid or missing JSON body" }),
    };
  }

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

  const deliveryMap = {
    "monthly": "price_1Qznq0ClYp4p5ca6cwYIZMmr",
    "quarterly": "price_1QznqmClYp4p5ca6J41HeYSC",
    "biannual": "price_1QznrXClYp4p5ca6tCdYPZYn",
  };

  const priceId = priceMap[plan];
  const volume = plan.split("-")[0];
  const interval = plan.split("-")[1];
  const deliveryPrice = deliveryMap[interval];

  if (!priceId) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Invalid plan selected." }),
    };
  }

  let line_items;

  if (volume === "3l") {
    // Free shipping for 3L
    line_items = [{ price: priceId, quantity: 1 }];
  } else {
    // Add delivery as second item
    line_items = [
      { price: priceId, quantity: 1 },
      { price: deliveryPrice, quantity: 1 }
    ];
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items,
      success_url: "https://olivolja.se/tack",
      cancel_url: "https://olivolja.se/avbrutet",
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
