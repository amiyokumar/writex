/*
   
 *  
 *  Copyright (c) 2014-2022. All rights reserved.
 */

const { passwordStrength } = require('check-password-strength');
const passwordComplexityOptions = [
  {
    id: 0,
    value: 'Too weak',
    minDiversity: 0,
    minLength: 0,
  },
  {
    id: 1,
    value: 'Weak',
    minDiversity: 2,
    minLength: 6,
  },
  {
    id: 2,
    value: 'Medium',
    minDiversity: 3,
    minLength: 8,
  },
  {
    id: 3,
    value: 'Strong',
    minDiversity: 4,
    minLength: 10,
  },
];

const passwordComplexity = {};

passwordComplexity.validate = (password) => {
  const response = passwordStrength(password, passwordComplexityOptions);
  return !(response.id === 0 || response.id === 1);
};

module.exports = passwordComplexity;
