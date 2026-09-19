/**
 * Single source of truth for MERV capacity / resistance guidance.
 * Shopper surfaces (FAQ, PDP, home MERV, Filter Clock, llms) import from here.
 */

/** Short callout for chips, clocks, and footers. */
export const MERV_CAPACITY_SHORT =
  "Higher MERV adds resistance. Modern units usually handle it better than older ones — check capacity before you upgrade.";

/** Full capacity paragraph (capacity, resistance, modern vs older). */
export const MERV_CAPACITY_NOTE =
  "When you pick a MERV rating, weigh capacity: tighter filters add resistance by design. Modern HVAC units generally handle higher ratings better than older ones. If the furnace or air handler is older, start lower unless the equipment manual says a tighter filter is OK.";

/** Rating ladder without the capacity caveat. */
export const MERV_RATING_BLURB =
  "MERV 8 is standard everyday filtration. MERV 11 is better for pets and mild allergies. MERV 13 offers higher filtration for asthma and sensitivities. MERV 8 Carbon adds odor reduction.";

/** Homepage / site FAQ answer for “What MERV rating should I buy?” */
export const MERV_PICK_FAQ_ANSWER = `${MERV_RATING_BLURB} ${MERV_CAPACITY_NOTE}`;

/** Compact assistant / llms answer. */
export const MERV_PICK_LLMS_ANSWER =
  "MERV 8 for everyday dust; MERV 11 for pets and mild allergies; MERV 13 for higher filtration needs; MERV 8 Carbon for odors. Higher MERV adds resistance — modern units handle it better than older ones; confirm capacity before upgrading.";

/** Allergy / MERV 13 change-guide FAQ line. */
export const MERV_13_CAPACITY_FAQ =
  "MERV 13 is the usual upgrade for asthma and allergy-sensitive homes when the HVAC system can handle the extra resistance. Modern units generally take higher ratings better than older ones. Change it on the early side of the 30–90 day window so capture stays high. Confirm with your equipment manual before jumping from MERV 8 to 13 on a 1-inch slot.";
