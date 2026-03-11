import { z } from 'zod';

// Fuel Schema
export const fuelFormSchema = z.object({
  fuel_name: z.string().trim().min(1, 'Fuel name is required').max(125, 'Fuel name is too long'),
  type: z.string().trim().min(1, 'Type is required').max(125, 'Type is too long'),
});

export type FuelFormSchema = z.infer<typeof fuelFormSchema>;

// Tank Storage Schema
export const tankStorageFormSchema = z.object({
  Fuel: z.number().min(1, 'Fuel is required'),
  tank_number: z.number().min(1, 'Tank number is required'),
  capacity: z.string().min(1, 'Capacity is required'),
  min_level_alert: z.number().min(0, 'Minimum level alert must be 0 or greater'),
});

export type TankStorageFormSchema = z.infer<typeof tankStorageFormSchema>;

// Fuel Motor Schema
export const fuelMotorFormSchema = z.object({
  tank_id: z.number().min(1, 'Tank is required'),
  motor_name: z.string().trim().min(1, 'Motor name is required').max(100, 'Motor name is too long'),
  fuel_id: z.number().min(1, 'Fuel is required'),
});

export type FuelMotorFormSchema = z.infer<typeof fuelMotorFormSchema>;

// Price History Schema
export const priceHistoryFormSchema = z.object({
  fuel: z.number().min(1, 'Fuel is required'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().trim().optional(),
});

export type PriceHistoryFormSchema = z.infer<typeof priceHistoryFormSchema>;

// Inventory Transaction Schema
export const inventoryTransactionFormSchema = z.object({
  tank_id: z.number().min(1, 'Tank is required'),
  fuel_id: z.number().min(1, 'Fuel is required'),
  transaction_type: z.enum(['purchase_in', 'sale_out', 'lending_out', 'return_in', 'adjustment']),
  quantity: z.number().min(1, 'Quantity must be 1 or greater'),
  reference_type: z.enum(['sale', 'lending', 'purchase', 'adjustment']),
  reference_id: z.number().min(1, 'Reference ID is required'),
  date_time: z.string().min(1, 'Date is required'),
  adjustment_direction: z.enum(['in', 'out']).nullable().optional(),
  description: z.string().trim().max(1000, 'Description is too long'),
}).superRefine((values, ctx) => {
  if (values.transaction_type === 'adjustment' && !values.adjustment_direction) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Adjustment direction is required',
      path: ['adjustment_direction'],
    });
  }
});

export type InventoryTransactionFormSchema = z.infer<typeof inventoryTransactionFormSchema>;
