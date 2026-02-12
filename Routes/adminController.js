const { Database } = require("../Database");

 const getAllUsers = (req, res) => {
  const sql = "SELECT id, username, email, role, created_at FROM signupusersData";
  Database.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

const getAllOrders = (req, res) => {
  const sql = "SELECT * FROM orders";
  Database.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};
module.exports = {getAllUsers,getAllOrders}
