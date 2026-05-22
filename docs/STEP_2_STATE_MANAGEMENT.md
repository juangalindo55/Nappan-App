# Step 2 — State Management Integration with Zustand

## Objective

Use persistent Zustand stores as the app-level source of truth for order flow, cart, customer profile context, and live-event booking drafts.

This step is not a greenfield Zustand setup. The rewrite app already has Zustand stores in place. The work for Step 2 is to document the current state boundaries, preserve the existing domain-aware cart architecture, and integrate the stores consistently across screens.

## Current State

The rewrite app currently has these persisted Zustand stores:

```txt
src/store/cart.store.ts
  Cart state, cart item actions, extras, pricing recalculation, validation, reset
  localStorage key: nappan-cart

src/store/user.store.ts
  Customer profile context
  localStorage key: nappan-user

src/store/booking.store.ts
  Live-event booking draft state
  localStorage key: nappan-booking

src/features/orders/order-flow.store.ts
  Selected order category and derived order type
  localStorage key: nappan-order-flow
```

Supporting domain/service files:

```txt
src/domain/cart.domain.ts
src/domain/cart.pricing.ts
src/domain/cart.validators.ts
src/services/customer.service.ts
src/lib/customer-profile-session.ts
```

Zustand is already installed and should remain the state-management layer.

## Store Boundaries

### Cart Store

File:

```txt
src/store/cart.store.ts
```

Responsibility:

- Hold the full cart object.
- Add and remove cart items.
- Update item quantity.
- Add, remove, and replace item extras.
- Recalculate pricing through `calculateCart`.
- Validate the cart through `validateCart`.
- Persist cart contents across refreshes.

Current shape:

```ts
cart: Cart
addItem(item: Omit<CartItem, 'id'>): void
removeItem(id: string): void
updateQuantity(id: string, qty: number): void
updateItemExtras(itemId: string, newExtras: CartExtra[]): void
addExtra(itemId: string, extra: CartExtra): void
removeExtra(itemId: string, extraId: string): void
validate(): { valid: boolean; errors: string[] }
reset(): void
```

Important:

Do not replace this store with a simplified `items: CartItem[]` example. The existing cart store is tied to the cart domain model and already supports extras, pricing summary, validation, UUID item IDs, and mixed cart types.

### User Store

File:

```txt
src/store/user.store.ts
```

Responsibility:

- Hold the active customer profile context for screens that need customer data.
- Persist the selected/loaded customer profile across refreshes.
- Provide simple set/clear actions.

Current shape:

```ts
profile: UserProfile | null
setProfile(profile: UserProfile): void
clearProfile(): void
```

Current profile type:

```ts
type UserProfile = {
  name: string
  phone: string
  tierName: string | null
  tierSlug: string | null
  discountPercent: number | null
}
```

Customer lookup/create logic should stay in service/session files, not inside the store:

```txt
src/services/customer.service.ts
src/lib/customer-profile-session.ts
```

The store should be the global profile holder. Services should handle Supabase/customer persistence, then write the result into `useUserStore`.

### Booking Store

File:

```txt
src/store/booking.store.ts
```

Responsibility:

- Hold the live-event inquiry draft while a user navigates or refreshes.
- Persist incomplete live-event form fields.
- Reset the draft after completion/cancellation.

Current shape:

```ts
liveEventDraft: LiveEventDraft
updateLiveEventDraft(draft: Partial<LiveEventDraft>): void
resetLiveEventDraft(): void
```

Current draft type:

```ts
type LiveEventDraft = {
  name: string
  phone: string
  guestCount: string
  eventDate: string
}
```

Keep this scoped to the actual live-event form. Do not introduce generic booking status fields until a concrete multi-step booking flow needs them.

### Order Flow Store

File:

```txt
src/features/orders/order-flow.store.ts
```

Responsibility:

- Persist the selected order category.
- Derive the order type from the category.
- Let order/checkout screens understand whether the user is in catering or event flow.

Current shape:

```ts
category: OrderCategory | null
orderType: OrderType | null
setOrderCategory(category: OrderCategory): void
resetOrderFlow(): void
```

Current categories:

```ts
type OrderCategory =
  | 'lunchbox'
  | 'artistic-box'
  | 'wellness-bar'
  | 'live-event'
```

Current order types:

```ts
type OrderType = 'catering' | 'event'
```

## Persistence Keys

Use these localStorage keys as the documented contract:

```txt
nappan-cart
nappan-user
nappan-booking
nappan-order-flow
```

There may also be legacy/customer-session storage used by profile utilities, such as customer profile session storage. Do not remove that blindly. If duplicate customer persistence becomes a problem, reconcile it deliberately after confirming which screens still read each source.

## Integration Tasks

### 1. Preserve the existing cart domain architecture

Keep:

- `Cart`
- `CartItem`
- `CartExtra`
- `calculateCart`
- `validateCart`
- UUID item IDs
- cart summary fields
- extras support

Avoid introducing a second simplified cart type or a parallel cart state.

### 2. Connect cart UI to `useCartStore`

Cart-related components should read from:

```ts
const { cart, addItem, removeItem, updateQuantity, reset, validate } = useCartStore()
```

Cart UI should use:

```ts
cart.items
cart.summary.subtotal
cart.summary.extras_total
cart.summary.shipping
cart.summary.total
```

When rendering items, use the generated cart item `id`, not only `productId`, because the same product may appear with different extras/configuration.

### 3. Connect profile/customer UI to `useUserStore`

Profile flows should:

1. Use customer service/session utilities to load or create customer profile data.
2. Normalize that result into the store profile shape.
3. Call `setProfile(profile)`.
4. Let other screens read `profile` from `useUserStore`.

Expected read pattern:

```ts
const { profile, setProfile, clearProfile } = useUserStore()
```

Do not add mock `loginByPhone` logic to the store. Supabase/customer lookup belongs in the service layer.

### 4. Connect checkout to cart and user state

Checkout screens should read:

```ts
const { cart, validate } = useCartStore()
const { profile } = useUserStore()
const { category, orderType } = useOrderFlowStore()
```

Checkout should use the user profile from `useUserStore` first, then fall back to session utilities only if needed during transition.

### 5. Connect live-event form to `useBookingStore`

Live-event inquiry form fields should read/write:

```ts
const { liveEventDraft, updateLiveEventDraft, resetLiveEventDraft } = useBookingStore()
```

Update the draft as fields change so the user does not lose partially-entered live-event details while navigating or refreshing.

### 6. Keep direct imports unless an index becomes useful

An index file is optional. Direct imports are fine:

```ts
import { useCartStore } from '@/store/cart.store'
import { useUserStore } from '@/store/user.store'
import { useBookingStore } from '@/store/booking.store'
import { useOrderFlowStore } from '@/features/orders/order-flow.store'
```

Only add `src/store/index.ts` if it clearly improves ergonomics without creating circular imports.

## Manual Testing

### Cart persistence

1. Add an item to the cart.
2. Refresh the page.
3. Confirm the cart still contains the item.
4. Confirm localStorage contains `nappan-cart`.

### Cart pricing and extras

1. Add an item with extras.
2. Confirm extras render on the cart item.
3. Confirm `cart.summary.extras_total` updates.
4. Confirm `cart.summary.total` updates.
5. Remove an extra and confirm totals recalculate.

### Cart validation

1. Trigger checkout with a valid cart.
2. Confirm `validate()` returns no blocking errors.
3. Trigger checkout with invalid/missing data if possible.
4. Confirm validation errors are visible or handled.

### Order category persistence

1. Select each order category:
   - lunchbox
   - artistic-box
   - wellness-bar
   - live-event
2. Refresh the page after selecting.
3. Confirm `category` persists.
4. Confirm `orderType` is `event` only for `live-event` and `catering` otherwise.
5. Confirm localStorage contains `nappan-order-flow`.

### User profile context

1. Load or create a customer profile through the profile flow.
2. Confirm `useUserStore().profile` is set.
3. Navigate to checkout.
4. Confirm checkout can read the same profile.
5. Refresh the page.
6. Confirm localStorage contains `nappan-user` and profile context remains available.

### Live-event draft persistence

1. Start filling the live-event form.
2. Navigate away or refresh.
3. Return to the form.
4. Confirm the draft fields remain populated.
5. Complete/cancel the flow.
6. Confirm `resetLiveEventDraft()` clears the draft.
7. Confirm localStorage contains `nappan-booking` while a draft exists.

## Success Criteria

Step 2 is complete when:

- `cart.store.ts` remains domain-aware and persisted under `nappan-cart`.
- Cart actions continue to recalculate totals through `calculateCart`.
- Cart validation remains available through `validateCart`.
- Cart UI reads from `cart.items` and `cart.summary`.
- Cart item rendering/actions use cart item IDs, not only product IDs.
- `user.store.ts` persists customer profile context under `nappan-user`.
- Profile/customer flows set and clear `useUserStore().profile` correctly.
- Checkout can read cart, user profile, and order-flow state.
- `booking.store.ts` persists live-event draft state under `nappan-booking`.
- Live-event form fields survive navigation/refresh until reset.
- `order-flow.store.ts` persists selected order category and derived order type under `nappan-order-flow`.
- No duplicate or conflicting cart/user/booking stores are introduced.
- `npm run build` passes.
- `npm run lint` passes, if lint is configured.
- Browser console has no store hydration or runtime errors.

## What Step 2 Enables

After Step 2 integration:

- Cart survives navigation and refresh.
- Cart pricing stays centralized in the domain pricing function.
- Extras and mixed-cart behavior remain supported.
- Customer profile context is available across profile, cart, and checkout screens.
- Live-event draft state survives interruptions.
- Order category/type is available across the order flow.
- Components avoid prop drilling and read only the state they need.

## What Not To Do

- Do not rewrite the cart store into a simple `items: []` store.
- Do not move Supabase/customer lookup logic into `user.store.ts`.
- Do not add mock login methods to the store.
- Do not introduce generic booking state until the UI flow requires it.
- Do not create a mega-store that combines cart, user, booking, and order-flow state.
- Do not rename localStorage keys without a migration plan.
- Do not remove legacy customer session handling until every reader has been identified.

## Relationship to Step 1 and Step 3

```txt
Step 1: Data fetching and services
Step 2: Persistent app state and cross-screen integration
Step 3: Backend/customer/order integration against Supabase
```

Step 2 should keep API/service responsibilities separate from store responsibilities:

```txt
Supabase/services -> normalize data -> Zustand stores -> components render/use state
```

Components should not duplicate persistent state locally when a store already owns that state.
