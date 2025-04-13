#!/bin/env bash

REPO_URL="https://github.com/indyleo/Catalyst.git"
REPO_NAME="Catalyst"
LOGFILE="run_$(date +%F_%H-%M-%S).log"

set -euo pipefail
trap 'error "Script failed: see failed command above"' ERR

# Logging functions
info()  { echo -e "\033[1;34m[INFO]\033[0m $1"; }
warn()  { echo -e "\033[1;33m[WARN]\033[0m $1"; }
error() { echo -e "\033[1;31m[ERROR]\033[0m $1"; }

exec > >(tee -a "$LOGFILE") 2>&1

# Check dependencies
for cmd in git fzf; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        error "$cmd is not installed. Please install it before continuing."
        exit 1
    fi
done

# Clone if not present
if [ ! -d "$REPO_NAME" ]; then
    info "Cloning repository..."
    git clone "$REPO_URL" "$REPO_NAME"
else
    info "Repository already exists: $REPO_NAME"
fi

cd "$REPO_NAME"

# Pull all remote branches
info "Fetching remote branches..."
branches=$(git ls-remote --heads origin | awk '{print $2}' | sed 's|refs/heads/||')

# Build fzf options
options=$(echo "$branches" | awk '{print "run:"$1"\nview:"$1}')
options="$options\nlocal:run current branch without pulling"

# Prompt user
choice=$(echo -e "$options" | fzf --prompt="Choose an action: ")

# Extract action and branch
action="${choice%%:*}"
branch="${choice#*:}"

checkout_branch() {
    local branch=$1
    info "Checking out '$branch' branch..."

    if git show-ref --verify --quiet "refs/heads/$branch"; then
        git checkout "$branch"
    else
        git fetch origin "$branch":"$branch"
        git checkout "$branch"
    fi

    if ! git rev-parse --abbrev-ref --symbolic-full-name @{u} >/dev/null 2>&1; then
        git branch --set-upstream-to="origin/$branch" "$branch"
        info "Tracking set to origin/$branch"
    fi
}

# Handle choices
case "$action" in
    run)
        checkout_branch "$branch"
        git pull
        info "Running run.sh on branch '$branch'..."
        ./run.sh
        ;;
    view)
        checkout_branch "$branch"
        git pull
        info "Showing run.sh from branch '$branch'..."
        less ./run.sh
        ;;
    local)
        current_branch=$(git rev-parse --abbrev-ref HEAD)
        info "Running run.sh without pulling (on $current_branch)..."
        ./run.sh
        ;;
    *)
        error "Unknown option selected."
        exit 1
        ;;
esac

