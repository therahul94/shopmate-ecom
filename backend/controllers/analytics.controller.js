import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

export const getAnalytics = async (req, res) => {
    try {
        const analyticsData = await getAnalyticsData();

        const endDate = new Date();
        const startDate = new Date(new Date() - 7 * 24 * 60 * 60 * 1000);

        const dailySalesData = await getDailySalesData(startDate, endDate);
        return res.json({
            analyticsData,
            dailySalesData
        })

    } catch (error) {
        console.log("Error in getAnalytics Controller", error.message);
        return res.status(500).json({ message: "Server Error", error: error.response });
    }
}

const getAnalyticsData = async () => {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    // total sales
    const salesData = await Order.aggregate([
        {
            $group: {
                _id: null,
                totalSales: { $sum: 1 },
                totalRevenue: { $sum: "$totalAmount" }
            }
        }
    ]);
    const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

    return {
        users: totalUsers,
        products: totalProducts,
        totalSales,
        totalRevenue
    }
}

const getDailySalesData = async (startDate, endDate) => {
    try {

        const dailySalesData = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            }, {
                $group: {
                    _id: { $dateToString: { format: `%Y-%m-%d`, date: "$createdAt" } },
                    sales: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" }
                }
            }, {
                $sort: { _id: 1 }
            }
        ]);

        // Why we are doing the below things, isn't it extra?
        /*
            The problem with aggregation is, This only returns days where sales actually happend.
            If you had orders on Sept 1 and Sept 3, but nothing on Sept 2, the result will be:
            [
                { _id: "25-09-01", sales: 5, revenue: 1000 },
                { _id: "25-09-03", sales: 2, revenue: 400 }
            ]
            Notice Sept 2 is missing.
            The getDatesInRange + map step forces every date in the range to appear in the result, even if it has 0 sales.
        */
        const dateArray = getDatesInRange(startDate, endDate);
        return dateArray.map(date => {
            const foundData = dailySalesData.find(item => item._id === date);
            return {
                date,
                sales: foundData?.sales || 0,
                revenue: foundData?.revenue || 0
            }
        })

    } catch (error) {
        throw error;
    }
}

function getDatesInRange(startDate, endDate) {
    const dates = [];
    const currentDate = new Date(startDate);

    while (currentDate < endDate) {
        dates.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
}