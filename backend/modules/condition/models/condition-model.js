const mongoose = require('mongoose');

// Define schema
const conditionSchema = new mongoose.Schema({
  ConditionID: {
    type: Number,
    unique: true,
  },
  ConditionName: {
    type: String,
    required: true,
  },
  Description: {
    type: String,
    required: true,
  },
  Severity: {
    type: String,
    enum: ['Mild', 'Moderate', 'Severe'],
    required: true,
  }
});

// Create model
const Condition = mongoose.model('Condition', conditionSchema);

// Auto-increment ConditionID manually
async function getNextConditionID() {
  const lastCondition = await Condition.findOne().sort({ ConditionID: -1 });
  return lastCondition ? lastCondition.ConditionID + 1 : 1;
}

// CRUD operations
exports.getAllConditions = async () => await Condition.find();

exports.getConditionById = async (id) => await Condition.findOne({ ConditionID: id });

exports.addNewCondition = async (conditionData) => {
  const nextID = await getNextConditionID();
  const newCondition = new Condition({ ConditionID: nextID, ...conditionData });
  return await newCondition.save();
};

exports.updateExistingCondition = async (id, updatedData) => {
  return await Condition.findOneAndUpdate({ ConditionID: id }, updatedData, { new: true });
};

exports.deleteCondition = async (id) => {
  return await Condition.findOneAndDelete({ ConditionID: id });
};
