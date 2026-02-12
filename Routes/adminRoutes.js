const express = require("express")
const {isAdmin} = require("../Middleware/VerifyToken")
const {auth} = require("../Middleware/VerifyToken")
const {getAllUsers} = require("./adminController")
const {getAllOrders} = require("./adminController")
const {Database} = require("../Database")
const router = express.Router();

router.get("/users",auth, isAdmin, getAllUsers);
router.get("/orders", auth, isAdmin, getAllOrders);
router.get("/dashboard", auth, async (req, res) => {
  try {
    
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const query = `
      SELECT
        (SELECT COUNT(*) FROM signupusersData) AS total_users,
        (SELECT COUNT(*) FROM orders) AS total_orders,
        (SELECT IFNULL(SUM(total_amount), 0) FROM orders) AS total_revenue
    `;

    Database.query(query, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }

      res.json(results[0]);
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
router.put("/orders/:id", auth, isAdmin, (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  const sql = "UPDATE orders SET status = ? WHERE id = ?";

  Database.query(sql, [status, orderId], (err, result) => {
    if (err) return res.status(500).json({ message: "Update failed" });

    res.json({ message: "Order updated" });
  });
});
module.exports = router;