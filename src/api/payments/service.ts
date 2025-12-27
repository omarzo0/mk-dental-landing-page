/**
 * Payment service placeholder
 * TODO: Integrate with actual payment provider when ready
 */

/**
 * Get a customer by user ID (placeholder)
 */
export async function getCustomerByUserId(userId: string) {
  return null;
}

/**
 * Get customer state (placeholder)
 */
export async function getCustomerState(userId: string) {
  return null;
}

/**
 * Get all subscriptions for a user (placeholder)
 */
export async function getUserSubscriptions(userId: string) {
  return [];
}

/**
 * Check if a user has an active subscription (placeholder)
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  return false;
}

/**
 * Get checkout URL for a specific product (placeholder)
 */
export async function getCheckoutUrl(customerId: string, productSlug: string): Promise<string | null> {
  return null;
}
