import sys
import re

with open('src/components/portals/AdminControlPortal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the button for emergency_direct
btn_pattern = r'<button\s*onClick=\{\(\) => setActiveAdminTab\(\'emergency_direct\'\)\}.*?</button>'
content = re.sub(btn_pattern, '', content, flags=re.DOTALL)

# Remove the content block for emergency_direct
content_block_pattern = r'\{activeAdminTab === \'emergency_direct\' && \(.*?(?=\{/\* TAB 3: SYSTEM AUDIT & NODES \*/\})'
content = re.sub(content_block_pattern, '', content, flags=re.DOTALL)

# Remove 'emergency_direct' | from useState
content = content.replace(" | 'emergency_direct'", "")

with open('src/components/portals/AdminControlPortal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
