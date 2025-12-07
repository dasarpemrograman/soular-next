#!/bin/bash

# ============================================
# SOULAR NEXT - DATABASE SETUP SCRIPT
# ============================================
# This script helps you set up the Soular Next database quickly

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         SOULAR NEXT - Database Setup Script               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "supabase/migrations/100_complete_schema.sql" ]; then
    print_error "Migration file not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

echo "Please choose setup method:"
echo ""
echo "1) Supabase CLI (Recommended)"
echo "2) Direct psql connection"
echo "3) Manual instructions (for Supabase Dashboard)"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        print_info "Using Supabase CLI..."
        echo ""

        # Check if Supabase CLI is installed
        if ! command -v supabase &> /dev/null; then
            print_error "Supabase CLI is not installed!"
            echo ""
            echo "Install it with:"
            echo "  npm install -g supabase"
            echo "  or"
            echo "  brew install supabase/tap/supabase"
            exit 1
        fi

        print_success "Supabase CLI found"

        # Check if project is linked
        if [ ! -f ".supabase/config.toml" ]; then
            print_warning "Project not linked to Supabase"
            echo ""
            read -p "Enter your Supabase project ref: " project_ref
            supabase link --project-ref "$project_ref"
            print_success "Project linked"
        fi

        echo ""
        print_info "Running migration..."
        supabase db reset
        print_success "Migration complete!"

        echo ""
        read -p "Do you want to seed test data? (y/n): " seed_choice
        if [ "$seed_choice" = "y" ] || [ "$seed_choice" = "Y" ]; then
            print_info "Seeding test data..."
            supabase db execute < supabase/seed.sql
            print_success "Test data seeded!"
        fi

        echo ""
        print_info "Verifying migration..."
        supabase db execute < supabase/verify_migration.sql
        ;;

    2)
        echo ""
        print_info "Using direct psql connection..."
        echo ""

        read -p "Enter database host (e.g., db.xxx.supabase.co): " db_host
        read -p "Enter database name (default: postgres): " db_name
        db_name=${db_name:-postgres}
        read -p "Enter database user (default: postgres): " db_user
        db_user=${db_user:-postgres}

        echo ""
        print_info "Running migration..."
        psql -h "$db_host" -U "$db_user" -d "$db_name" -f supabase/migrations/100_complete_schema.sql

        if [ $? -eq 0 ]; then
            print_success "Migration complete!"

            echo ""
            read -p "Do you want to seed test data? (y/n): " seed_choice
            if [ "$seed_choice" = "y" ] || [ "$seed_choice" = "Y" ]; then
                print_info "Seeding test data..."
                psql -h "$db_host" -U "$db_user" -d "$db_name" -f supabase/seed.sql
                print_success "Test data seeded!"
            fi

            echo ""
            print_info "Verifying migration..."
            psql -h "$db_host" -U "$db_user" -d "$db_name" -f supabase/verify_migration.sql
        else
            print_error "Migration failed!"
            exit 1
        fi
        ;;

    3)
        echo ""
        print_info "Manual Setup Instructions:"
        echo ""
        echo "1. Go to https://app.supabase.com"
        echo "2. Select your project"
        echo "3. Click 'SQL Editor' in the left sidebar"
        echo "4. Click 'New Query'"
        echo ""
        echo "5. Copy the content of: ${BLUE}supabase/migrations/100_complete_schema.sql${NC}"
        echo "   Paste it into the editor and click 'Run'"
        echo ""
        echo "6. (Optional) For test data, copy: ${BLUE}supabase/seed.sql${NC}"
        echo "   Paste it into a new query and click 'Run'"
        echo ""
        echo "7. Verify migration by running: ${BLUE}supabase/verify_migration.sql${NC}"
        echo ""
        print_warning "Remember to create an admin user after setup!"
        exit 0
        ;;

    *)
        print_error "Invalid choice!"
        exit 1
        ;;
esac

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                 Setup Complete! 🎉                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
print_info "Next steps:"
echo ""
echo "1. Update your ${BLUE}.env.local${NC} file with Supabase credentials"
echo ""
echo "2. Start your Next.js app:"
echo "   ${BLUE}npm run dev${NC}"
echo ""
echo "3. Sign up a new user"
echo ""
echo "4. Make yourself admin by running this SQL:"
echo "   ${YELLOW}UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';${NC}"
echo ""
echo "5. Test these features:"
echo "   • Browse films at /films"
echo "   • View events at /events"
echo "   • Check collections at /collections"
echo "   • Join forum discussions at /forum"
echo ""
print_success "You're all set! Happy coding! 🚀"
echo ""
