# Healthcare Dataset - Entities and Fields

## 1. Patient
- **_id** : `ObjectId`  
- **name** : `String`  
- **age** : `Number`  
- **gender** : `String`  
- **bloodType** : `String`  

## 2. Doctor
- **_id** : `ObjectId`  
- **name** : `String`  
 

## 3. Hospital
- **_id** : `ObjectId`  
- **name** : `String`  


## 4. InsuranceProvider
- **_id** : `ObjectId`  
- **name** : `String`  
 

## 5. MedicalCondition
- **_id** : `ObjectId`  
- **name** : `String`  
 

## 6. Admission
- **_id** : `ObjectId`  
- **patientId** : `Patient._id`  
- **doctorId** : `Doctor._id`  
- **hospitalId** : `Hospital._id`  
- **insuranceProviderId** : `InsuranceProvider._id`  
- **medicalConditionId** : `MedicalCondition._id`  
- **dateOfAdmission** : `Date`  
- **billingAmount** : `Number`  


