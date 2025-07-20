import {ValidationError} from "../../../../packages/error-handler";

export const validatePropertyData = (data: any) => {
  const { title, description, price, landmark, city, state, country, pincode } = data;

  // Check if all fields are provided
  if (!title || !description || !price || !landmark || !city || !state || !country || !pincode) {
    throw new ValidationError('All fields are required');
  }

  // Validate price
  if (typeof price !== 'number' || price <= 0) {
    throw new ValidationError('Price must be a positive number');
  }

  // Validate zip code format (example: US zip code)
  const zipCodeRegex = /^\d{5}(-\d{4})?$/;
  if (!zipCodeRegex.test(pincode)) {
    throw new ValidationError('Invalid zip code format');
  }
}
