import json
import subprocess
import sys
import os

def main():
    try:
        # Load package.json
        with open("package.json", "r", encoding="utf-8") as f:
            pj = json.load(f)
        
        deps = pj.get("dependencies", {})
        dev_deps = pj.get("devDependencies", {})
        all_deps = {**deps, **dev_deps}
        
        # Check for mailchimp-marketing
        if "mailchimp-marketing" in all_deps and all_deps["mailchimp-marketing"] != "^3.0.80":
            print("🔍 Found mailchimp-marketing with incorrect version")
            
            # Update the version
            if "mailchimp-marketing" in deps:
                pj["dependencies"]["mailchimp-marketing"] = "^3.0.80"
            if "mailchimp-marketing" in dev_deps:
                pj["devDependencies"]["mailchimp-marketing"] = "^3.0.80"
            
            # Write updated package.json
            with open("package.json", "w", encoding="utf-8") as f:
                json.dump(pj, f, indent=2)
                f.write("\n")  # Add trailing newline
            
            print("📝 Updated package.json")
            
            # Git operations
            try:
                # Check if we're in a git repo
                subprocess.check_call(
                    ["git", "rev-parse", "--git-dir"],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL
                )
                
                # Create and checkout branch
                subprocess.check_call(
                    ["git", "checkout", "-b", "chore/heal-mailchimp"],
                    stderr=subprocess.STDOUT
                )
                print("🌿 Created branch: chore/heal-mailchimp")
                
                # Stage changes
                subprocess.check_call(["git", "add", "package.json"])
                
                # Commit
                subprocess.check_call(
                    ["git", "commit", "-m", "fix(deps): pin mailchimp-marketing to ^3.0.80"]
                )
                print("💾 Committed changes")
                
                # Push
                subprocess.check_call(
                    ["git", "push", "-u", "origin", "chore/heal-mailchimp"]
                )
                print("⬆️ Pushed to origin")
                
                # Try to create PR if gh CLI is available
                try:
                    subprocess.check_call(
                        ["gh", "pr", "create", "--fill"],
                        stdout=subprocess.DEVNULL
                    )
                    print("✅ Pull request created")
                except (subprocess.CalledProcessError, FileNotFoundError):
                    print("ℹ️ Could not create PR automatically (gh CLI not available or not configured)")
                
            except subprocess.CalledProcessError as e:
                print(f"⚠️ Git operation failed: {e}")
                print("ℹ️ Changes were made to package.json but not committed")
            
            print("\n✅ mailchimp-marketing pinned to ^3.0.80")
        else:
            print("ℹ️ No mailchimp-marketing adjustment needed.")
            
    except FileNotFoundError:
        print("❌ Error: package.json not found in current directory")
        sys.exit(1)
    except json.JSONDecodeError:
        print("❌ Error: package.json is not valid JSON")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
