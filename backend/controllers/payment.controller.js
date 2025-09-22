import { stripe } from "../lib/stripe.js";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";

export const createCheckoutSession = async (req, res) => {
    try {
        const { products, couponCode } = req.body;
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: "Invalid or Empty products array" });
        }

        let totalAmount = 0;
        const lineItems = products.map(product => {
            const amount = Math.round(product.price * 100);
            totalAmount += amount * product.quantity;
            return {
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: product.name,
                        images: [product.image]
                    },
                    unit_amount: amount
                },
                quantity: product.quantity || 1
            }
        });
        let coupon = null;
        if (couponCode) {
            coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
            if (coupon) {
                totalAmount -= Math.round(totalAmount * coupon.discountPercentage / 100);
            }
        }
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
            discounts: coupon ?
                [
                    {
                        coupon: await createStripeCoupon(coupon.discountPercentage)
                    }
                ] : [],
            metadata: {
                userId: req.user._id.toString(),
                couponCode: couponCode || "",
                products: JSON.stringify(
                    products.map(item => ({
                        id: item._id,
                        quantity: item.quantity,
                        price: item.price
                    }))
                )
            }
        });
        // if the totalAmount is more than 2000 INR then we are going to generate one coupon for that user.
        if (totalAmount >= 200000) {
            await createNewCoupon(req.user._id)
        }
        res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
    } catch (error) {
        console.log("Error in the create checkout session controller", error.message);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
}

// usd
// export const createCheckoutSession = async (req, res) => {
//     try {
// 		const { products, couponCode } = req.body;

// 		if (!Array.isArray(products) || products.length === 0) {
// 			return res.status(400).json({ error: "Invalid or empty products array" });
// 		}

// 		let totalAmount = 0;

// 		const lineItems = products.map((product) => {
// 			const amount = Math.round(product.price * 100); // stripe wants u to send in the format of cents
// 			totalAmount += amount * product.quantity;

// 			return {
// 				price_data: {
// 					currency: "usd",
// 					product_data: {
// 						name: product.name,
// 						images: [product.image],
// 					},
// 					unit_amount: amount,
// 				},
// 				quantity: product.quantity || 1,
// 			};
// 		});

// 		let coupon = null;
// 		if (couponCode) {
// 			coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
// 			if (coupon) {
// 				totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
// 			}
// 		}

// 		const session = await stripe.checkout.sessions.create({
// 			payment_method_types: ["card"],
// 			line_items: lineItems,
// 			mode: "payment",
// 			success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
// 			cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
// 			discounts: coupon
// 				? [
// 						{
// 							coupon: await createStripeCoupon(coupon.discountPercentage),
// 						},
// 				  ]
// 				: [],
// 			metadata: {
// 				userId: req.user._id.toString(),
// 				couponCode: couponCode || "",
// 				products: JSON.stringify(
// 					products.map((p) => ({
// 						id: p._id,
// 						quantity: p.quantity,
// 						price: p.price,
// 					}))
// 				),
// 			},
// 		});
//         // if the totalAmount is more than $200 then we are going to generate one coupon for that user.
// 		if (totalAmount >= 20000) {
// 			await createNewCoupon(req.user._id);
// 		}
// 		res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
// 	} catch (error) {
// 		console.error("Error processing checkout:", error);
// 		res.status(500).json({ message: "Error processing checkout", error: error.message });
// 	}
// };


const createStripeCoupon = async (discountPercentage) => {
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once"
    });
    return coupon.id;
}

async function createNewCoupon(userId) {
    /*

        Math.random().toString(36).substring(2, 8).toUpperCase();
        
        1. `Math.random()`

        Generates a random floating-point number between `0` (inclusive) and `1` (exclusive).
        Example:
        Math.random();  // e.g., 0.5839218374

        ---

        2. `.toString(36)`

        Converts that random number to **base-36** (digits `0-9` and letters `a-z`).
        So `0.5839218374` becomes something like:
        "0.xt9vhs"

        ---

        3. `.substring(2, 8)`

        * Removes the `0.` at the start.
        * Takes characters from **index 2 to index 8** (6 characters total).
        Example:
        "0.xt9vhs".substring(2, 8);  // "xt9vhs"
        ---

        4. `.toUpperCase()`

        Converts all characters to **uppercase**:
        "xt9vhs".toUpperCase();  // "XT9VHS"
        ---

       Final Output

        You’ll get a **random 6-character alphanumeric string in uppercase**, e.g., `"A9BZ3K"`, `"X1L4TQ"`.

        ---
    */
    await Coupon.findOneAndDelete({userId});
    const newCoupon = new Coupon({
        code: 'GIFT' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        discountPercentage: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userId: userId
    });
    await newCoupon.save();
    return newCoupon;
}

export const checkoutSuccess = async(req, res) => {
    try {
        const {sessionId} = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if(session.payment_status === 'paid'){
            // payment is successful so
            // whatever coupon we have applied now it is applicable so we have to deactivate it.
            if(session.metadata.couponCode) {
                await Coupon.findOneAndUpdate({code: session.metadata.couponCode, userId: session.metadata.userId}, {
                    isActive: false
                })
            }

            // now create a new order because the payment is successful
            const products = JSON.parse(session.metadata.products);
            const newOrder = new Order({
                user: session.metadata.userId,
                products: products.map(product => ({
                    product: product.id,
                    quantity: product.quantity,
                    price: product.price
                })),
                totalAmount: session.amount_total / 100, // changing from paisa to ruppees.
                paymentIntent: session.payment_intent,
                stripeSessionId: sessionId
            });
            await newOrder.save();
            return res.status(200).json({
                success: true,
                message: "Payment successful, order created, and coupon deactivated if used.",
                orderId: newOrder._id
            })

        }
    } catch (error) {
        console.log("Error in the checkoutSuccess controller", error.message);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
}