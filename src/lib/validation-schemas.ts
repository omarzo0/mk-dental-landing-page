import { z } from "zod";

export const productSchema = z.object({
    name: z.string()
        .min(2, "Product name must be at least 2 characters")
        .max(200, "Product name cannot exceed 200 characters"),
    description: z.string()
        .min(10, "Product description must be at least 10 characters")
        .max(2000, "Product description cannot exceed 2000 characters"),
    category: z.string()
        .min(1, "Category is required")
        .max(100, "Category cannot exceed 100 characters"),
    subcategory: z.string().optional(),
    price: z.number().min(0, "Price must be a positive number"),
    comparePrice: z.number().min(0, "Compare price must be a positive number").optional().nullable(),
    images: z.array(z.string()).min(1, "At least one image is required"),
    inventory: z.object({
        quantity: z.number().int().min(0, "Inventory quantity must be a non-negative integer"),
        lowStockAlert: z.number().int().min(0, "Low stock alert must be a non-negative integer").optional(),
        trackInventory: z.boolean().optional(),
    }),
    status: z.enum(["active", "inactive", "draft"]).optional(),
    featured: z.boolean().optional(),
    productType: z.enum(["single", "package"]).optional(),
    discount: z.object({
        type: z.enum(["percentage", "fixed"]),
        value: z.number().min(0, "Discount value must be a positive number"),
        isActive: z.boolean(),
    }).optional(),
    specifications: z.object({
        size: z.array(z.number()).optional(),
    }).optional(),
}).superRefine((data, ctx) => {
    if (data.discount?.isActive && data.discount.value <= 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Discount value must be greater than 0 if active",
            path: ["discount", "value"]
        });
    }
});

export const categorySchema = z.object({
    name: z.string()
        .min(2, "Category name must be at least 2 characters")
        .max(100, "Category name cannot exceed 100 characters"),
    icon: z.string().max(200, "Icon path/name too long").optional(),
    isActive: z.boolean().optional(),
    showInMenu: z.boolean().optional(),
    showInHomepage: z.boolean().optional(),
    subcategories: z.array(z.object({
        name: z.string().min(1, "Subcategory name is required"),
        icon: z.string().optional(),
        isActive: z.boolean().optional(),
    })).optional(),
});

export const packageSchema = z.object({
    name: z.string()
        .min(2, "Package name must be at least 2 characters")
        .max(200, "Package name cannot exceed 200 characters"),
    description: z.string()
        .min(10, "Package description must be at least 10 characters")
        .max(2000, "Package description cannot exceed 2000 characters"),
    price: z.number().min(0, "Price must be a positive number"),
    comparePrice: z.number().min(0, "Compare price must be a positive number").optional().nullable(),
    images: z.array(z.string()).min(1, "At least one image is required"),
    packageItems: z.array(z.object({
        productId: z.string().min(1, "Product ID is required"),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
    })).min(1, "At least one product is required in a package"),
    status: z.enum(["active", "inactive", "draft"]).optional(),
    inventory: z.object({
        quantity: z.number().int().min(0, "Inventory quantity must be a non-negative integer"),
        lowStockAlert: z.number().int().min(0, "Low stock alert must be a non-negative integer").optional(),
    }).optional(),
    discount: z.object({
        type: z.enum(["percentage", "fixed"]),
        value: z.number().min(0, "Discount value must be a positive number"),
        isActive: z.boolean(),
    }).optional(),
}).superRefine((data, ctx) => {
    if (data.discount?.isActive && data.discount.value <= 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Discount value must be greater than 0 if active",
            path: ["discount", "value"]
        });
    }
});

export const couponSchema = z.object({
    code: z.string()
        .trim()
        .min(3, "Coupon code must be at least 3 characters")
        .max(20, "Coupon code cannot exceed 20 chars")
        .regex(/^[A-Za-z0-9_-]+$/, "Coupon code can only contain letters, numbers, hyphens, and underscores"),
    name: z.string()
        .trim()
        .min(1, "Coupon name is required")
        .max(100, "Coupon name cannot exceed 100 characters"),
    description: z.string()
        .trim()
        .max(500, "Description cannot exceed 500 characters")
        .optional(),
    discountType: z.enum(["percentage", "fixed", "free_shipping"]),
    discountValue: z.number().min(0, "Discount value must be a positive number"),
    maxDiscountAmount: z.number().min(0, "Max discount amount must be a positive number").nullable().optional(),
    usageLimit: z.object({
        total: z.number().int().min(1, "Total usage limit must be at least 1").nullable().optional(),
        perCustomer: z.number().int().min(1, "Per customer limit must be at least 1").nullable().optional(),
    }).optional(),
    minimumPurchase: z.number().min(0, "Minimum purchase must be a positive number").optional(),
    minimumItems: z.number().int().min(0, "Minimum items must be a non-negative integer").optional(),
    restrictions: z.object({
        categories: z.array(z.string()).optional(),
        products: z.array(z.string()).optional(),
        excludeCategories: z.array(z.string()).optional(),
        excludeProducts: z.array(z.string()).optional(),
        productTypes: z.array(z.string()).optional(),
        newCustomersOnly: z.boolean().optional(),
        firstOrderOnly: z.boolean().optional(),
    }).optional(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    isActive: z.boolean().optional(),
    notes: z.string().trim().max(500, "Notes cannot exceed 500 characters").optional(),
}).superRefine((data, ctx) => {
    if (data.discountType !== "free_shipping" && (data.discountValue === undefined || data.discountValue === null || data.discountValue === 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Discount value must be greater than 0 if not free shipping",
            path: ["discountValue"]
        });
    }
});

export const shippingFeeSchema = z.object({
    name: z.string()
        .min(2, "Name must be between 2 and 100 characters")
        .max(100, "Name must be between 2 and 100 characters"),
    fee: z.number().min(0, "Shipping fee must be a non-negative number"),
    isFreeShipping: z.boolean().optional(),
    isActive: z.boolean().optional(),
});

export const shippingSettingsSchema = z.object({
    defaultMethod: z.string().trim().max(50, "Default method cannot exceed 50 characters").optional(),
    freeShippingThreshold: z.number().min(0, "Free shipping threshold must be a positive number").optional(),
    weightUnit: z.enum(["kg", "lb"]).optional(),
    dimensionUnit: z.enum(["cm", "in"]).optional(),
    enableShippingCalculator: z.boolean().optional(),
    handlingTime: z.object({
        min: z.number().int().min(0, "Minimum handling time must be a non-negative integer").optional(),
        max: z.number().int().min(0, "Maximum handling time must be a non-negative integer").optional(),
        unit: z.enum(["days", "hours"]).optional(),
    }).optional(),
});

export const adminSchema = z.object({
    username: z.string()
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username cannot exceed 30 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: z.string()
        .trim()
        .email("Invalid email format"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, "Password must contain at least one lowercase, uppercase, number, and special character")
        .optional()
        .or(z.literal("")),
    profile: z.object({
        firstName: z.string()
            .trim()
            .min(2, "First name must be at least 2 characters")
            .max(50, "First name cannot exceed 50 characters"),
        lastName: z.string()
            .trim()
            .min(2, "Last name must be at least 2 characters")
            .max(50, "Last name cannot exceed 50 characters"),
        phone: z.string()
            .trim()
            .max(20, "Phone cannot exceed 20 characters")
            .optional()
            .or(z.literal("")),
    }).optional(),
    role: z.enum(["admin", "super_admin"]).optional(),
    isActive: z.boolean().optional(),
});

export const passwordChangeSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string()
        .min(8, "New password must be at least 8 characters long")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, "Password must contain at least one lowercase, uppercase, number, and special character"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const bannerSchema = z.object({
    title: z.string()
        .trim()
        .min(1, "Title is required")
        .max(100, "Title cannot exceed 100 characters"),
    subtitle: z.string()
        .trim()
        .max(200, "Subtitle cannot exceed 200 characters")
        .optional(),
    image: z.string().min(1, "Banner image is required"),
    mobileImage: z.string().optional(),
    link: z.string().trim().optional(),
    linkType: z.enum(["product", "category", "external", "none"]).default("none"),
    linkTarget: z.string().optional(),
    buttonText: z.string().trim().max(50, "Button text cannot exceed 50 characters").optional(),
    position: z.enum(["hero", "secondary", "promotional"]).default("hero"),
    order: z.number().int().min(0, "Order must be a non-negative integer").default(0),
    isActive: z.boolean().default(true),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.startDate && data.endDate && new Date(data.endDate) < new Date(data.startDate)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "End date must be after start date",
            path: ["endDate"]
        });
    }
});

export const paymentMethodSchema = z.object({
    name: z.string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name cannot exceed 50 characters")
        .regex(/^[a-z_]+$/, "Name must be lowercase letters and underscores only"),
    displayName: z.string()
        .trim()
        .max(100, "Display name cannot exceed 100 characters")
        .optional()
        .or(z.literal("")),
    description: z.string()
        .trim()
        .max(500, "Description cannot exceed 500 characters")
        .optional()
        .or(z.literal("")),
    instructions: z.string()
        .trim()
        .max(1000, "Instructions cannot exceed 1000 characters")
        .optional()
        .or(z.literal("")),
    icon: z.string()
        .trim()
        .max(100, "Icon path cannot exceed 100 characters")
        .optional()
        .or(z.literal("")),
    enabled: z.boolean().default(true),
    testMode: z.boolean().default(false),
    fees: z.object({
        type: z.enum(["fixed", "percentage"]),
        value: z.number().min(0, "Fee value must be a positive number"),
    }).nullable().optional(),
    minAmount: z.number().min(0, "Minimum amount must be a positive number").optional().nullable(),
    maxAmount: z.number().min(0, "Maximum amount must be a positive number").optional().nullable(),
    order: z.number().int().min(0, "Order must be a non-negative integer").default(0),
});

export const profileUpdateSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    phone: z.string().optional().or(z.literal("")),
});
