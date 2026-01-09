"""
Stripe integration service for PDF Leaf.
Handles checkout sessions, webhooks, and subscription management.
"""
import os
import stripe
from typing import Optional
from .supabase_client import supabase

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

# Price IDs from environment (set these after creating products in Stripe Dashboard)
PRICE_IDS = {
    "starter": os.getenv("STRIPE_STARTER_PRICE_ID"),
    "pro": os.getenv("STRIPE_PRO_PRICE_ID"),
    "enterprise": os.getenv("STRIPE_ENTERPRISE_PRICE_ID"),
}

# Plan limits mapping
PLAN_LIMITS = {
    "free": 100,
    "starter": 2000,
    "pro": 10000,
    "enterprise": 50000,
}


def get_or_create_customer(user_id: str, email: str) -> str:
    """
    Get existing Stripe customer or create a new one.
    Returns the Stripe customer ID.
    """
    # Check if user already has a Stripe customer ID
    result = supabase.table("profiles").select("stripe_customer_id").eq("id", user_id).single().execute()

    if result.data and result.data.get("stripe_customer_id"):
        return result.data["stripe_customer_id"]

    # Create new Stripe customer
    customer = stripe.Customer.create(
        email=email,
        metadata={"user_id": user_id}
    )

    # Store customer ID in profile
    supabase.table("profiles").update({
        "stripe_customer_id": customer.id
    }).eq("id", user_id).execute()

    return customer.id


def create_checkout_session(
    user_id: str,
    email: str,
    plan_id: str,
    success_url: str,
    cancel_url: str
) -> Optional[str]:
    """
    Create a Stripe Checkout session for subscription.
    Returns the checkout URL or None if error.
    """
    if plan_id not in PRICE_IDS or not PRICE_IDS[plan_id]:
        raise ValueError(f"Invalid plan: {plan_id}")

    customer_id = get_or_create_customer(user_id, email)

    session = stripe.checkout.Session.create(
        customer=customer_id,
        payment_method_types=["card"],
        line_items=[{
            "price": PRICE_IDS[plan_id],
            "quantity": 1,
        }],
        mode="subscription",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": user_id,
            "plan_id": plan_id,
        },
        subscription_data={
            "metadata": {
                "user_id": user_id,
                "plan_id": plan_id,
            }
        }
    )

    return session.url


def create_portal_session(user_id: str, return_url: str) -> Optional[str]:
    """
    Create a Stripe Customer Portal session for managing subscription.
    Returns the portal URL or None if error.
    """
    # Get customer ID from profile
    result = supabase.table("profiles").select("stripe_customer_id").eq("id", user_id).single().execute()

    if not result.data or not result.data.get("stripe_customer_id"):
        raise ValueError("User has no Stripe customer ID")

    session = stripe.billing_portal.Session.create(
        customer=result.data["stripe_customer_id"],
        return_url=return_url,
    )

    return session.url


def handle_webhook_event(payload: bytes, sig_header: str) -> dict:
    """
    Handle Stripe webhook events.
    Returns a dict with status and message.
    """
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return {"status": "error", "message": "Invalid payload"}
    except stripe.error.SignatureVerificationError:
        return {"status": "error", "message": "Invalid signature"}

    event_type = event["type"]
    data = event["data"]["object"]

    if event_type == "checkout.session.completed":
        return handle_checkout_completed(data)
    elif event_type == "customer.subscription.updated":
        return handle_subscription_updated(data)
    elif event_type == "customer.subscription.deleted":
        return handle_subscription_deleted(data)
    elif event_type == "invoice.payment_failed":
        return handle_payment_failed(data)

    return {"status": "ok", "message": f"Unhandled event type: {event_type}"}


def handle_checkout_completed(session: dict) -> dict:
    """Handle successful checkout session completion."""
    user_id = session.get("metadata", {}).get("user_id")
    plan_id = session.get("metadata", {}).get("plan_id")
    subscription_id = session.get("subscription")

    if not user_id or not plan_id:
        return {"status": "error", "message": "Missing metadata"}

    # Update user's plan in profiles
    supabase.table("profiles").update({
        "plan": plan_id,
        "monthly_limit": PLAN_LIMITS.get(plan_id, 100),
    }).eq("id", user_id).execute()

    # Get subscription details
    subscription = stripe.Subscription.retrieve(subscription_id)

    # Create or update subscription record
    supabase.table("subscriptions").upsert({
        "user_id": user_id,
        "stripe_subscription_id": subscription_id,
        "stripe_price_id": PRICE_IDS.get(plan_id),
        "status": subscription.status,
        "current_period_start": subscription.current_period_start,
        "current_period_end": subscription.current_period_end,
    }, on_conflict="user_id").execute()

    return {"status": "ok", "message": f"Subscription created for plan {plan_id}"}


def handle_subscription_updated(subscription: dict) -> dict:
    """Handle subscription updates (plan changes, renewals)."""
    subscription_id = subscription["id"]
    status = subscription["status"]

    # Get user_id from metadata
    user_id = subscription.get("metadata", {}).get("user_id")
    plan_id = subscription.get("metadata", {}).get("plan_id")

    if not user_id:
        # Try to find user by subscription ID
        result = supabase.table("subscriptions").select("user_id").eq("stripe_subscription_id", subscription_id).single().execute()
        if result.data:
            user_id = result.data["user_id"]
        else:
            return {"status": "error", "message": "Could not find user for subscription"}

    # Update subscription record
    supabase.table("subscriptions").update({
        "status": status,
        "current_period_start": subscription["current_period_start"],
        "current_period_end": subscription["current_period_end"],
    }).eq("stripe_subscription_id", subscription_id).execute()

    # If subscription is active and plan changed, update profile
    if status == "active" and plan_id:
        supabase.table("profiles").update({
            "plan": plan_id,
            "monthly_limit": PLAN_LIMITS.get(plan_id, 100),
        }).eq("id", user_id).execute()

    return {"status": "ok", "message": f"Subscription {subscription_id} updated to {status}"}


def handle_subscription_deleted(subscription: dict) -> dict:
    """Handle subscription cancellation."""
    subscription_id = subscription["id"]

    # Get user from subscription
    result = supabase.table("subscriptions").select("user_id").eq("stripe_subscription_id", subscription_id).single().execute()

    if not result.data:
        return {"status": "error", "message": "Subscription not found"}

    user_id = result.data["user_id"]

    # Downgrade to free plan
    supabase.table("profiles").update({
        "plan": "free",
        "monthly_limit": PLAN_LIMITS["free"],
    }).eq("id", user_id).execute()

    # Update subscription status
    supabase.table("subscriptions").update({
        "status": "canceled",
    }).eq("stripe_subscription_id", subscription_id).execute()

    return {"status": "ok", "message": f"User {user_id} downgraded to free"}


def handle_payment_failed(invoice: dict) -> dict:
    """Handle failed payment."""
    subscription_id = invoice.get("subscription")

    if subscription_id:
        # Update subscription status
        supabase.table("subscriptions").update({
            "status": "past_due",
        }).eq("stripe_subscription_id", subscription_id).execute()

    return {"status": "ok", "message": "Payment failure recorded"}


def get_subscription_status(user_id: str) -> dict:
    """Get user's current subscription status."""
    # Get profile
    profile_result = supabase.table("profiles").select("plan, monthly_limit, stripe_customer_id").eq("id", user_id).single().execute()

    if not profile_result.data:
        return {
            "plan": "free",
            "status": "active",
            "monthly_limit": PLAN_LIMITS["free"],
        }

    profile = profile_result.data

    # Get subscription details if exists
    sub_result = supabase.table("subscriptions").select("*").eq("user_id", user_id).single().execute()

    if sub_result.data:
        return {
            "plan": profile.get("plan", "free"),
            "status": sub_result.data.get("status", "active"),
            "monthly_limit": profile.get("monthly_limit", PLAN_LIMITS["free"]),
            "current_period_end": sub_result.data.get("current_period_end"),
        }

    return {
        "plan": profile.get("plan", "free"),
        "status": "active",
        "monthly_limit": profile.get("monthly_limit", PLAN_LIMITS["free"]),
    }
