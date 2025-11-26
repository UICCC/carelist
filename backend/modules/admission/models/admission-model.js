const mongoose = require('mongoose');

// Define the schema
const admissionSchema = new mongoose.Schema({
  patientId: {
    type: Number,
    required: true
  },
  doctorId: {
    type: Number,
    required: true
  },
  admissionDate: {
    type: Date,
    required: true
  },
  dischargeDate: {
    type: Date
  },
  reason: {
    type: String,
    required: true,
    minlength: 3
  }
});

// Create the model
const Admission = mongoose.model('Admission', admissionSchema);

// Export CRUD operations
module.exports = {
  getAllAdmissions: async () => await Admission.find(),
  getAdmissionById: async (id) => await Admission.findById(id),
  addNewAdmission: async (data) => {
    const newAdmission = new Admission(data);
    return await newAdmission.save();
  },
  updateExistingAdmission: async (id, data) => {
    return await Admission.findByIdAndUpdate(id, data, { new: true });
  },
  deleteAdmission: async (id) => {
    return await Admission.findByIdAndDelete(id);
  }
};
