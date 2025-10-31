#!/usr/bin/env python3
"""
System Stats Task
Gathers detailed system statistics
"""

import sys
import json
import platform
from datetime import datetime

try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False

def get_system_stats():
    """Gather comprehensive system statistics"""
    if not HAS_PSUTIL:
        return {
            'timestamp': datetime.now().isoformat(),
            'platform': {
                'system': platform.system(),
                'release': platform.release(),
                'version': platform.version(),
                'machine': platform.machine(),
                'processor': platform.processor()
            },
            'note': 'Install psutil for detailed stats: pip install psutil'
        }
    
    stats = {
        'timestamp': datetime.now().isoformat(),
        'platform': {
            'system': platform.system(),
            'release': platform.release(),
            'version': platform.version(),
            'machine': platform.machine(),
            'processor': platform.processor()
        },
        'cpu': {
            'count': psutil.cpu_count(),
            'percent': psutil.cpu_percent(interval=1),
            'freq': psutil.cpu_freq()._asdict() if psutil.cpu_freq() else None
        },
        'memory': {
            'total': psutil.virtual_memory().total,
            'available': psutil.virtual_memory().available,
            'percent': psutil.virtual_memory().percent
        },
        'disk': {
            'total': psutil.disk_usage('/').total if platform.system() != 'Windows' else psutil.disk_usage('C:\\').total,
            'used': psutil.disk_usage('/').used if platform.system() != 'Windows' else psutil.disk_usage('C:\\').used,
            'free': psutil.disk_usage('/').free if platform.system() != 'Windows' else psutil.disk_usage('C:\\').free,
            'percent': psutil.disk_usage('/').percent if platform.system() != 'Windows' else psutil.disk_usage('C:\\').percent
        }
    }
    
    return stats

if __name__ == '__main__':
    try:
        stats = get_system_stats()
        print(json.dumps(stats, indent=2))
        sys.exit(0)
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)
