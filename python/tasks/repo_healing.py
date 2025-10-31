#!/usr/bin/env python3
"""
Repo Healing Task
Analyzes and repairs repository health issues
"""

import sys
import os
import json
from datetime import datetime

def check_file_integrity():
    """Check for common file integrity issues"""
    issues = []
    
    # Check for common missing files
    required_files = ['.gitignore', 'README.md', 'package.json']
    for file in required_files:
        if not os.path.exists(file):
            issues.append(f"Missing required file: {file}")
    
    return issues

def check_dependencies():
    """Check for dependency issues"""
    issues = []
    
    if os.path.exists('package.json'):
        try:
            with open('package.json', 'r') as f:
                pkg = json.load(f)
                if 'dependencies' not in pkg and 'devDependencies' not in pkg:
                    issues.append("No dependencies defined in package.json")
        except Exception as e:
            issues.append(f"Error reading package.json: {str(e)}")
    
    return issues

def heal_repo():
    """Run repository healing checks"""
    print(f"[{datetime.now().isoformat()}] Starting repository healing...")
    
    file_issues = check_file_integrity()
    dep_issues = check_dependencies()
    
    all_issues = file_issues + dep_issues
    
    if not all_issues:
        print("✓ Repository is healthy!")
        return 0
    else:
        print(f"⚠ Found {len(all_issues)} issue(s):")
        for issue in all_issues:
            print(f"  - {issue}")
        return 1

if __name__ == '__main__':
    exit_code = heal_repo()
    sys.exit(exit_code)
