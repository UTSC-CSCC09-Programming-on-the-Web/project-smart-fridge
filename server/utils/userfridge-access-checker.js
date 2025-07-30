
const { UserFridge } = require("../models");

const userFridgeAccessChecker = async (userId, fridgeId) => {
  if (!userId || !fridgeId) {
    console.error("Invalid userId or fridgeId:", { userId, fridgeId });
    return false;
  }

  const userFridge = await UserFridge.findOne({
    where: { user_id: userId, fridge_id: fridgeId },
  });
  if (!userFridge) {
    console.error("User does not have access to fridge:", { userId, fridgeId });
    return false;
  }

  return true;
};

module.exports = userFridgeAccessChecker;
