
import re

replacements = {
    r'\b_0x2db826\b': 'waitCounter',
    r'\b_0xcf8a5a\b': 'clearWaitInterval',
    r'\b_0x32ae03\b': 'foundSquad173',
    r'\b_0x1981c0\b': 'PLATOON_LOOP',
    r'\b_0x520bb4\b': 'onClearCallback',
    r'\b_0x2181ed\b': 'uType1050',
    r'\b_0x1d34a8\b': 'deployCycleIndex',
    r'\b_0x1391ef\b': 'unitTypesArray',
    r'\b_0x239563\b': 'configCounts',
    r'\b_0x5e5f44\b': 'idleCheckCounter',
    r'\b_0x26f945\b': 'idleInterval',
    r'\b_0x32c65d\b': 'hasActiveHelis',
    r'\b_0x2ef8a2\b': 'waitLoopCounter',
    r'\b_0x39317e\b': 'WAIT_LOOP_MAX',
    r'\b_0x2ea976\b': 'loopInterval',
    r'\b_0x3fcd18\b': 'primaryTargetId',
    r'\b_0x5d43df\b': 'primaryTargetsFound',
    r'\b_0x2fb0dc\b': 'primaryTarget',
    r'\b_0x27f83d\b': 'heliIds',
    r'\b_0x96d076\b': 'getHeliIds',
    r'\b_0x19c4dc\b': 'findTargetOrBase',
    r'\b_0x46e768\b': 'getCurrentTargetOrNext',
}

import sys

file_path = '/Users/alessandro/Downloads/Game/TESTING-AREA/test.js'
with open(file_path, 'r') as f:
    content = f.read()

for pattern, replacement in replacements.items():
    content = re.sub(pattern, replacement, content)

with open(file_path, 'w') as f:
    f.write(content)
