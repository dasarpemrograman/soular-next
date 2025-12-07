import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/subscription - Get subscription plans or user's current subscription
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const searchParams = request.nextUrl.searchParams;
        const action = searchParams.get("action");

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (action === "plans") {
            // Get all available subscription plans
            const { data: plans, error } = await supabase
                .from("subscription_plans")
                .select("*")
                .eq("is_active", true)
                .order("sort_order", { ascending: true });

            if (error) {
                console.error("Error fetching subscription plans:", error);
                return NextResponse.json(
                    { error: "Failed to fetch subscription plans" },
                    { status: 500 },
                );
            }

            return NextResponse.json({ plans });
        }

        // For user subscription info, authentication is required
        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        // Get user's current subscription using the helper function
        const { data: subscription, error: subError } = await supabase.rpc(
            "get_user_subscription",
            {
                p_user_id: user.id,
            },
        );

        if (subError) {
            console.error("Error fetching user subscription:", subError);
            return NextResponse.json(
                { error: "Failed to fetch subscription" },
                { status: 500 },
            );
        }

        // Get user's profile for additional subscription info
        const { data: profile } = await supabase
            .from("profiles")
            .select("subscription_plan, subscription_status, subscription_ends_at")
            .eq("id", user.id)
            .single();

        return NextResponse.json({
            subscription: subscription && subscription.length > 0 ? subscription[0] : null,
            profile: profile || {
                subscription_plan: "free",
                subscription_status: "active",
                subscription_ends_at: null,
            },
        });
    } catch (error) {
        console.error("Error in subscription route:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

// POST /api/subscription - Subscribe to a plan (simplified - would integrate with payment provider)
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const body = await request.json();
        const { plan_name, billing_cycle } = body;

        // Validate input
        if (!plan_name || !billing_cycle) {
            return NextResponse.json(
                { error: "Plan name and billing cycle are required" },
                { status: 400 },
            );
        }

        if (!["monthly", "yearly"].includes(billing_cycle)) {
            return NextResponse.json(
                { error: "Billing cycle must be monthly or yearly" },
                { status: 400 },
            );
        }

        // Get the plan details
        const { data: plan, error: planError } = await supabase
            .from("subscription_plans")
            .select("*")
            .eq("name", plan_name)
            .eq("is_active", true)
            .single();

        if (planError || !plan) {
            return NextResponse.json(
                { error: "Invalid subscription plan" },
                { status: 404 },
            );
        }

        // Calculate subscription period
        const now = new Date();
        const periodEnd = new Date(now);
        if (billing_cycle === "monthly") {
            periodEnd.setMonth(periodEnd.getMonth() + 1);
        } else {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        }

        // Check if user already has a subscription
        const { data: existingSub } = await supabase
            .from("user_subscriptions")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (existingSub) {
            // Update existing subscription
            const { error: updateError } = await supabase
                .from("user_subscriptions")
                .update({
                    plan_id: plan.id,
                    status: "active",
                    billing_cycle,
                    current_period_start: now.toISOString(),
                    current_period_end: periodEnd.toISOString(),
                    cancel_at_period_end: false,
                    cancelled_at: null,
                })
                .eq("user_id", user.id);

            if (updateError) {
                console.error("Error updating subscription:", updateError);
                return NextResponse.json(
                    { error: "Failed to update subscription" },
                    { status: 500 },
                );
            }
        } else {
            // Create new subscription
            const { error: insertError } = await supabase
                .from("user_subscriptions")
                .insert({
                    user_id: user.id,
                    plan_id: plan.id,
                    status: "active",
                    billing_cycle,
                    current_period_start: now.toISOString(),
                    current_period_end: periodEnd.toISOString(),
                });

            if (insertError) {
                console.error("Error creating subscription:", insertError);
                return NextResponse.json(
                    { error: "Failed to create subscription" },
                    { status: 500 },
                );
            }
        }

        // Create payment transaction record
        const amount =
            billing_cycle === "monthly"
                ? plan.price_monthly
                : plan.price_yearly;

        await supabase.from("payment_transactions").insert({
            user_id: user.id,
            plan_id: plan.id,
            amount,
            currency: "USD",
            status: "completed",
            payment_method: "demo", // In production, would be actual payment method
            payment_provider: "stripe", // In production, would be actual provider
            metadata: {
                plan_name: plan.name,
                billing_cycle,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Subscription activated successfully",
            subscription: {
                plan: plan.name,
                billing_cycle,
                period_end: periodEnd.toISOString(),
            },
        });
    } catch (error) {
        console.error("Error in subscription creation:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

// DELETE /api/subscription - Cancel subscription
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        // Cancel subscription using helper function
        const { data, error } = await supabase.rpc("cancel_subscription", {
            p_user_id: user.id,
        });

        if (error) {
            console.error("Error cancelling subscription:", error);
            return NextResponse.json(
                { error: "Failed to cancel subscription" },
                { status: 500 },
            );
        }

        if (!data) {
            return NextResponse.json(
                { error: "No active subscription found" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            message:
                "Subscription cancelled. You will retain access until the end of your billing period.",
        });
    } catch (error) {
        console.error("Error in subscription cancellation:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
